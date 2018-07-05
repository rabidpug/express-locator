#!/usr/bin/env bash

# get branch name from repo
branch=$(git rev-parse --abbrev-ref HEAD)

#get package name from package.json
name=$(grep name package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')

#get current version from package.json
cur=$(grep version package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')

#get current prerelease id from current version
if [[ "$cur" =~ ([a-z]{1,}) ]]; then preid=$(echo "$cur" | grep -Eo '([a-z]{1,})'); else preid='live'; fi

#warning message if anything fails
warn="Versioning error from $cur on $branch branch. Strict versioning protocols are in place:\\n
1.  Checkout master to any non- ( master | next | beta ) branch\\n
2.  develop feature - don't forget a changelog, tests, flowtypes\\n
3.  assign ( alpha ) pre-( patch | minor | major ) version > yarn push [ <version> patch | minor | major ]\\n
4.  merge to ( beta ) branch\\n
5.  test and document\\n
6.  assign ( beta ) prerelease version > yarn push\\n
7.  merge to ( next ) branch\\n
9.  test and document\\n
8.  assign ( rc ) prerelease version > yarn push\\n
11. merge to ( master ) branch\\n
12. assign release version > yarn push\\n
hint: you can increment the ( alpha | beta | rc ) prerelease version by calling yarn push\\n
hint: you can inrement/assign the version without publishing by passing [ -n | --no-publish ]\\n
hint: you can immediately checkout to the next branch by passing [ -c | --checkout ], or skip the prompt by passing [ -p | --pass-checkout ]\\n";

#prompt function
function prompt
{
  PS3=$1
  shift
  select opt in "$@"
  do
    if [ -z "$opt" ];
    then
      prompt "Invalid entry, try again: " "$@"
      break;
    else
      echo "$opt"
      break;
    fi
  done
}

#assigning relation variables for branches
case "$branch" in
  "beta" )
    next='next'
    previd='alpha'
    newid='beta';;
  "next" )
    next='master'
    previd='beta'
    newid='rc';;
  "master" )
    next='dev'
    previd='rc'
    newid='';;
  * )
    next='beta'
    previd='live'
    newid='alpha';;
esac

#check if version coming from is invalid for current branch
if [ ! "$preid" = "$previd" ] && [ ! "$preid" = "$newid" ];
  then
    echo -e "$warn"
    exit 1;
fi

#determine new version
if [ -z "$newid" ];
  then
    prerelease=false
    ver=$(yarn --silent semver "$cur" -i patch)
  else
    prerelease=true
    version=$1
    if [ ! "$preid" = "live" ];
      then version='release'
    elif [[ ! "$version" =~ (major|minor|patch) ]];
      then version=$(prompt "Currently $cur - select your pre- <version>: " patch minor major );
    fi
    version=pre"$version"
    ver=$(yarn --silent semver "$cur" -i "$version" --preid "$newid");
fi

#get changelog for new version
changelog=$(awk "/v$ver/{f=1;next} /## v/{f=0} f" CHANGELOG.md | sed 's/$/<br \/>/' | tr '\n' ' ' | tr '\r' ' ')

#check if publishing and credentials
if [[ "$1$2$3" =~ (-n) ]] && [ ! "$branch" = "master" ] || [[ ! "$branch" =~ (beta|next|master) ]];
  then nopublish="yes"
elif [ -z "$GITHUB_USER" ] || [ -z "$changelog" ];
  then
    if [ -z "$changelog" ];
      then echo 'A changelog is required to publish. If you do not wish to publish, pass the ( -n | --no-publish ) flag.';
      else echo 'GITHUB_USER must be set as environment variables to publish. If you do not wish to publish, pass the ( -n | --no-publish ) flag.';
    fi
    exit 1;
fi

#prompt to continue
if [ $(prompt "$cur > $ver. Continue?: " yes no) = "no" ]; then exit 0; fi

#git add all, commit, increment version, and push
git add -A
git commit
npm version "$ver"
git push --tags origin "$branch";

#if publishing, add changelog to release
if [ -z "$nopublish" ];
  then
    data="{\"tag_name\":"\"v$ver\"",\"name\":"\"v$ver\"",\"body\":"\"$changelog\"",\"prerelease\":$prerelease}"
    curl --user "$GITHUB_USER" --data "$data" https://api.github.com/repos/rabidpug/"$name"/releases;
fi

#checkout to branch if on master branch, -c flag provided, or user responded yes
if [ ! "$branch" = "master" ] && [[ ! "$1$2$3" =~ (-p) ]];
then if [ "$branch" = "master" ] || [[ "$1$2$3" =~ (-c) ]] || [ $(prompt "Checkout to $next? this will override any uncommitted changes in $next: " yes no) = "yes" ]; then git checkout -B "$next"; fi; fi
