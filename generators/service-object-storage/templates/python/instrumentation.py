from ibmcloudenv import IBMCloudEnv
import swiftclient

authurl = IBMCloudEnv.getString('object_storage_auth_url')
if not '/v3' in authurl:
    authurl+='/v3'
user = IBMCloudEnv.getString('object_storage_user_id')
key = IBMCloudEnv.getString('object_storage_password')
os_options = {
    'project_id': IBMCloudEnv.getString('object_storage_project_id'),
    'user_id': IBMCloudEnv.getString('object_storage_user_id'),
    'region_name': IBMCloudEnv.getString('object_storage_region')
}
<% if (bluemix.backendPlatform.toLowerCase() === 'python') { %>
def getService(app):
    objectStorage = swiftclient.Connection(authurl=authurl,user=user,key=key,os_options=os_options, auth_version='3')

    return 'object-storage', objectStorage
<% } else { %>
def getService():
    objectStorage = swiftclient.Connection(authurl=authurl,user=user,key=key,os_options=os_options, auth_version='3')
    
    return 'object-storage', objectStorage
<% } %>
