if [ "$1" = "master" ];
then
  tag='latest'
elif [ "$1" = "next" ];
then
  tag='next'
elif [ "$1" = "beta" ];
then
  tag='beta';
else
  tag='';
fi

pkgver=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
name=$(cat package.json | grep name | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
pubs=$(npm view $name versions | grep -Eo "'(.*)'")
match=$(echo $pubs | grep -Eo "'$pkgver'")

if [ -z "$match" ] && [ ! -z "$tag" ];
then
  npm publish --tag $tag --ignore-scripts
  npm dist-tag add $name@$pkgver $tag
elif [ -z "$tag" ];
then
  echo 'Branch not for publishing';
else
  echo 'Version already published';
fi
