#!/usr/bin/env bash
name=$(cat package.json | grep name | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
branch=$(git rev-parse --abbrev-ref HEAD)
cur=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
curver=$(echo $cur | grep -Eo '[0-9]*\.[0-9]*\.[0-9]')
preid=$(echo $cur | grep -Eo '(alpha|beta|rc)')
assigned=''
changelog=$(<./CHANGELOG.md)

warn="Versioning error from $cur on $branch branch. Strict versioning protocols are in place:\n
1. Checkout master to any non- ( master | next | beta ) branch\n
2. assign ( alpha ) pre-( patch | minor | major ) version > yarn push [ <version> patch | minor | major ]\n
3. increment ( alpha ) prerelease version > yarn push\n
4. merge to ( beta ) branch\n
5. assign ( beta ) prerelease version > yarn push\n
6. test\n
7. increment ( beta ) prerelease version > yarn push\n
4. merge to ( next ) branch\n
5. assign ( rc ) prerelease version > yarn push\n
6. test\n
7. increment ( rc ) prerelease version > yarn push\n
8. merge to ( master ) branch\n
9. assign release version > yarn push\n";

function prompt
{
  PS3=$1
  shift
  select opt in $@
  do
    if [ -z "$opt" ];
    then
      prompt "Invalid entry, try again: " $@;
      break
    else
      echo $opt
      break;
    fi
  done
}

if [ "$branch" = "master" ];
then
  if [ ! "$preid" = "rc" ];
  then
    echo -e $warn
    exit 1;
  fi
  ver=$(yarn --silent semver $cur -i patch)
  assigned='y'
  echo "assigning release version $cur > $ver"
elif [ "$branch" = "next" ];
then
  if [[ ! $preid =~ (beta|rc) ]];
  then
    echo -e $warn
    exit 1;
  fi
  ver=$(yarn --silent semver $cur -i prerelease --preid rc)
  if [ "$preid" = 'rc' ];
  then
    echo "incrementing rc prerelease version $cur > $ver";
  else
    assigned='y'
    echo "assigning rc prerelease version $cur > $ver";
  fi;
elif [ "$branch" = "beta" ];
then
  if [[ ! $preid =~ (alpha|beta) ]];
  then
    echo -e $warn
    exit 1;
  fi
  ver=$(yarn --silent semver $cur -i prerelease --preid beta)
  if [ "$preid" = 'beta' ];
  then
    echo "incrementing beta prerelease version $cur > $ver";
  else
    assigned='y'
    echo "assigning beta prerelease version $cur > $ver";
  fi;
else
  if [ ! "$preid" = "alpha" ];
  then
    if [ ! -z "$preid" ];
    then
      echo -e $warn
      exit 1;
    fi
    version=$1
    if [[ ! $version =~ (major|minor|patch) ]];
    then
      version=$(prompt "Currently $curver - select your pre- <version>: " patch minor major );
    fi
    ver=$(yarn --silent semver $cur -i pre$version --preid alpha)
    assigned='y'
    echo "assigning alpha pre$version version $cur > $ver";
  else
    ver=$(yarn --silent semver $cur -i prerelease --preid alpha)
    echo "incrementing alpha prerelease version $cur > $ver"
  fi;
fi
changelog=$(echo "$changelog" | awk "/v$ver/{f=1;next} /#/{f=0} f")
echo "changelog: $changelog"
if [[ ! "$changelog" =~ ([a-zA-Z]) ]];
then
  echo 'A changelog is required, aborting'
  exit 0;
fi

cont=$(prompt "Continue?: " yes no)
if [ "$cont" = "no" ];
then
  exit 0;
else
  git add . && git commit .
  npm version $ver && git tag -f v$ver -m "$changelog" && echo "pushing to $branch with tag" && git push --tags origin $branch;
fi
