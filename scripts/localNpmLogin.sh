#!/bin/bash
login () {
  echo "logging into local npm registry"
  npm i -g npm-cli-login;
  npmUser=$(npm whoami --registry="https://npm.pkg.github.com");
  npmEmail=$(git config --get user.email);
  nodeAuthToken=$(cat ~/.npmrc | grep '^//npm.pkg.github.com' | cut -d "=" -f2-);

  NPM_EMAIL=$npmEmail NPM_USER=$npmUser NPM_PASS=$nodeAuthToken NPM_REGISTRY=http://local-npm-registry:4873 NPM_SCOPE=@tinystacks npm-cli-login;
}

localNpmUser=$(npm whoami --registry="http://local-npm-registry:4873" 2>/dev/null);

if [ -z "$localNpmUser" ] || [ "$localNpmUser" == "undefined" ];
  then
    login
  else
    echo "${localNpmUser} is already logged in to the local npm registry"
fi