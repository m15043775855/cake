#!/bin/sh
# Maven Wrapper script
set -e

# Determine the project base directory
if [ -z "$MAVEN_PROJECTBASEDIR" ]; then
  MAVEN_PROJECTBASEDIR=$(cd "$(dirname "$0")" && pwd)
  export MAVEN_PROJECTBASEDIR
fi

MAVEN_WRAPPER_JAR="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.jar"
MAVEN_WRAPPER_PROPERTIES="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.properties"

if [ -r "$MAVEN_WRAPPER_PROPERTIES" ]; then
  distributionUrl=$(grep "distributionUrl" "$MAVEN_WRAPPER_PROPERTIES" | cut -d'=' -f2-)
fi

MAVEN_HOME="$HOME/.m2/wrapper/dists/apache-maven-3.6.3"

if [ ! -d "$MAVEN_HOME" ]; then
  echo "Downloading Maven..."
  mkdir -p "$MAVEN_HOME"
  TMP_FILE=$(mktemp /tmp/maven-XXXXXX.zip)
  curl -sL "$distributionUrl" -o "$TMP_FILE"
  unzip -qo "$TMP_FILE" -d "$HOME/.m2/wrapper/dists/"
  rm -f "$TMP_FILE"
fi

MVN_CMD="$MAVEN_HOME/bin/mvn"

if [ ! -f "$MVN_CMD" ]; then
  # Try finding it in subdirectory
  MVN_CMD=$(find "$HOME/.m2/wrapper/dists/apache-maven-3.6.3" -name "mvn" -type f 2>/dev/null | head -1)
fi

exec "$MVN_CMD" "$@"
