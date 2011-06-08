#!/bin/bash
git pull origin master

# add new TOS to track here, just cut/paste the same pattern
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://www.facebook.com/terms.php > facebook_terms.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://developers.facebook.com/policy/ > facebook_dev_policy.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://dev.twitter.com/pages/api_terms > twitter_terms.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://dev.twitter.com/pages/display_guidelines > twitter_display_guidelines.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" https://foursquare.com/legal/apiplatformpolicy > foursquare_api_platform_policy.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" https://foursquare.com/legal/terms > foursquare_terms.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" https://foursquare.com/legal/api > foursquare_api_license.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://www.flickr.com/services/api/tos > flickr_api_tos.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://www.flickr.com/services/api/tos > flickr_api_tos.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://www.flickr.com/atos/pro > flickr_atos.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://www.google.com/accounts/TOS > google_tos.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://www.google.com/intl/en/privacy/privacy-policy.html > google_privacy_policy.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://mail.google.com/mail/help/program_policies.html > gmail_program_policy.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://mail.google.com/mail/help/legal_notices.html > gmail_legal_notices.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://developer.linkedin.com/docs/DOC-1013 > linkedin_api_tos.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://develop.github.com/p/general.html > github_api_overview.txt
lynx -dump -useragent="Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13" http://dev.fitbit.com/terms > fitbit_api_tos.txt



git add *.txt
git commit -am "batch"
git push origin master

