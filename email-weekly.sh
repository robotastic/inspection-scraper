#!/bin/bash
#requires: date,sendmail
function fappend {
    echo "$2">>$1;
}
YYYYMMDD=`date +%Y%m%d`

# CHANGE THESE
TOEMAIL="lukekb@gmail.com";
FREMAIL="luke@cookography.com";
SUBJECT="Weekly Cleaneats Summary - $YYYYMMDD";
MSGBODY=`mongo weekly-email.js`;

# DON'T CHANGE ANYTHING BELOW
TMP=`mktemp`

fappend $TMP "From: $FREMAIL";
fappend $TMP "To: $TOEMAIL";
fappend $TMP "Content-Type: text/html; charset=utf-8";
fappend $TMP "Reply-To: $FREMAIL";
fappend $TMP "Subject: $SUBJECT";
fappend $TMP "";
fappend $TMP "$MSGBODY";
fappend $TMP "";
fappend $TMP "";
cat $TMP|/usr/sbin/sendmail  -t;

rm $TMP;