Write-Host "env var access test"
Write-Host $env:IS_FREE_LOCAL
$env:IS_THIS_ACCESSIBLE="test1234"
echo "::set-output name=script::script1234"
echo "IS_THIS_ACCESSIBLE2=accessible2" >> $Env:GITHUB_ENV
