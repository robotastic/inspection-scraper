#!/bin/sh



NOW=$(date +"%b-%d-%y")
LOGFILE="/home/luke/scrape/logs/log-$NOW.log"
NODE="node"
MONGO="/Users/luke/Programming/Monogo/bin/mongod --dbpath ../data/db/"

$NODE scrape.js 
//$MONGO /home/luke/scrape/cleanup-everything.js 

echo $LOGFILE
cat $LOGFILE