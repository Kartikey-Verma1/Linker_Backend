## auth
- post - authProfile/login ✅
- post - authProfile/logout ✅
- post - authProfile/signup ✅

## profile
- patch - profile/edit ✅
- patch - profile/changePassword ✅
- delete - profile/delete ✅
- get - profile/view ✅

## connectionRequest
- post - connectionRequest/send/ingnore/:userId
- post - connectionRequest/send/interested/:userId
- post - connectionRequest/review/ignore/:requestId
- post - connectionRequest/review/interested/:requestId

## user
- get - user/connections
- get - user/requestes
- get - user/feed