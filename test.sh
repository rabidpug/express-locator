ver=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
changelog=$(awk "/v$ver/{f=1;next} /## v/{f=0} f" CHANGELOG.md | sed 's/$/<br \/>/' | tr '\n' ' ' | tr '\r' ' ')
prerelease=true
name=$(grep name package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
data="{\"tag_name\":"\"v$ver\"",\"name\":"\"v$ver\"",\"body\":"\"$changelog\"",\"prerelease\":$prerelease}"
echo "$data"
curl --user "rabidpug" --data "$data" https://api.github.com/repos/rabidpug/$name/releases;
