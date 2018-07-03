ver=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
changelog=$(awk "/v$ver/{f=1;next} /## v/{f=0} f" CHANGELOG.md | sed 's/$/<br \/>/' | tr '\n' ' ' | tr '\r' ' ')
if [ -z "$changelog" ];
then echo 'blah'; else echo "$changelog"; fi
