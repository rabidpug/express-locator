if [ "$1" = "master" ]; then tag='latest'
elif [ "$1" = "next" ]; then tag='next'
elif [ "$1" = "beta" ]; then tag='beta';
else tag=''; fi

pkgver=$(grep version package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')
name=$(grep name package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')
matchPublished=$(npm view "$name" versions | grep -Eo "'(.*)'" | grep -Eo "'$pkgver'")
matchTagged=$(curl https://api.github.com/repos/rabidpug/"$name"/releases | grep -Eo "\"v$pkgver\"")

if [ -z "$matchPublished" ] && [ ! -z "$tag" ] && [ ! -z "$matchTagged" ];
  then
    npm publish --tag "$tag" --ignore-scripts
    npm dist-tag add "$name"@"$pkgver" "$tag"
elif [ -z "$tag" ];
  then echo 'Branch not for publishing';
elif [ ! -z "$matchPublished" ];
  then echo 'Version already published';
  else echo 'Version not tagged for publishing';
fi
