#!/bin/sh 
# create signing process 
curl -X "POST" -H "Authorization: Basic Y29kZWphbTpBRkxpdGw0TEEyQWQx" -H \
"Content- Type:application/json" @codejam.json \
 "https://stage-api.e-signlive.com/aws/rest/services/codejam" | echo;