# This AWS Lambda function deletes all items associated with a given `userId` from a DynamoDB table 
# and then deletes the corresponding user from a Cognito User Pool. 
# It first queries the DynamoDB table for items with a specific `userId` 
# and a `PRODUCT` attribute equal to "product", deletes each of these items, 
# and finally removes the user from the Cognito User Pool. 
# The function handles errors at each step, 
# logging useful debugging information and returning appropriate HTTP status codes and messages.

import boto3
import json

def lambda_handler(event, context):
    # Initialize DynamoDB and Cognito clients
    dynamodb = boto3.resource('dynamodb')
    cognito_client = boto3.client('cognito-idp')
    table = dynamodb.Table('AUBMarketPlaceMainTable')  # Ensure this is your table name
    user_pool_id = 'eu-north-1_yY06qHPlb'  # Replace with your Cognito user pool ID

    # Extract user_id from the event
    user_id = event.get('queryStringParameters', {}).get('userId')
    if not user_id:
        print("No userId found in query string parameters.")
        return {
            'statusCode': 400,
            'body': json.dumps({"error": "No userId provided"})
        }
    else:
        print(f"Received userId: {user_id}")

    # Query the items based on UserID and PRODUCT='product'
    try:
        print(f"Querying items for UserID: {user_id} with PRODUCT equal to 'product'.")
        response = table.query(
            IndexName='UserID-PRODUCT-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('UserID').eq(user_id) &
                                   boto3.dynamodb.conditions.Key('PRODUCT').eq('product')
        )
        items = response.get('Items', [])
        print(f"Found {len(items)} items to delete for UserID: {user_id}.")
    except Exception as e:
        print(f"Error querying items for UserID {user_id}: {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({"error": f"Error querying items: {str(e)}"})
        }

    # Delete each found item using the actual primary key and sort key of the table
    for item in items:
        try:
            print(f"Attempting to delete item with PK (Category): {item['PK']} and SK (Item Number): {item['SK']}")
            table.delete_item(
                Key={
                    'PK': item['PK'],
                    'SK': item['SK']
                }
            )
            print(f"Deleted item with PK (Category): {item['PK']} and SK (Item Number): {item['SK']}.")
        except Exception as e:
            print(f"Error deleting item with PK: {item['PK']} and SK: {item['SK']}: {str(e)}")
            return {
                'statusCode': 400,
                'body': json.dumps({"error": f"Error deleting item: {str(e)}"})
            }

    # Delete the user from Cognito User Pool
    try:
        print(f"Attempting to delete user {user_id} from Cognito.")
        cognito_client.admin_delete_user(
            UserPoolId=user_pool_id,
            Username=user_id
        )
        print(f"Successfully deleted user {user_id} from Cognito.")
    except Exception as e:
        print(f"Error deleting user {user_id} from Cognito: {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({"error": f"Error deleting user from Cognito: {str(e)}"})
        }

    return {
        'statusCode': 200,
        'body': json.dumps({"message": "Successfully deleted all matched items and user from Cognito"})
    }
