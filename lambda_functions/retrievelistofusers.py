# This AWS Lambda function retrieves conversations for a specific user, including details about the latest message, 
# associated product, and the other participant's profile picture. 
# It queries two DynamoDB tables (Messages and Products) and retrieves user 
# information from Cognito. If an error occurs, it returns a `500` status code with the error message.

import json
import time
from decimal import Decimal
import boto3

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    cognito_client = boto3.client('cognito-idp')
    user_pool_id = 'eu-north-1_yY06qHPlb'  # Replace with your Cognito User Pool ID

    # URL for the default profile picture
    default_profile_picture_url = 'https://marketplacepictures.s3.eu-north-1.amazonaws.com/s3.png'

    messages_table = dynamodb.Table('Messages')
    products_table = dynamodb.Table('AUBMarketPlaceMainTable')  # Assuming this table has the relevant GSI

    try:
        user_id = event['queryStringParameters']['userId']
        
        # Step 1: Query the Messages table to get conversations related to the user
        response = messages_table.query(
            KeyConditionExpression='PK = :pk AND begins_with(SK, :prefix)',
            ExpressionAttributeValues={
                ':pk': f"User#{user_id}",
                ':prefix': "CONVO#"
            }
        )
        
        conversations_with_products = []

        for item in response['Items']:
            conversation_sk = item['SK']  # This is the ConversationID we will return
            
            # Step 2: Query the Messages table to get the latest message based on uploadDate or LastUpdated
            message_response = messages_table.query(
                KeyConditionExpression='PK = :pk',
                ExpressionAttributeValues={':pk': conversation_sk},
                ScanIndexForward=False,  # Sort in descending order by SK (assuming SK includes a timestamp or date)
                Limit=1  # We only need the latest message
            )
            last_updated_sk = message_response['Items'][0]['SK'] if message_response['Items'] else None
            
            product_id = item.get('ProductID')
            product_details = None
            profile_picture_url = default_profile_picture_url  # Use default initially
            
            # Identify the other participant
            other_participant_id = next(
                participant for participant in item['SK'].split('#')[1].split('-') if participant != user_id
            )
            
            # Add the domain to the other participant ID
            if '@mail.aub.edu' not in other_participant_id:
                other_participant_id += '@mail.aub.edu'
      
            # Search for OtherParticipant's profile picture by email in Cognito
            try:
                cognito_response = cognito_client.list_users(
                    UserPoolId=user_pool_id,
                    Filter=f'email="{other_participant_id}"'  # Search by email address
                )
           
                if cognito_response['Users']:
                    user_attributes = cognito_response['Users'][0]['Attributes']
                    profile_picture_attr = next((attribute['Value'] for attribute in user_attributes if attribute['Name'] == 'custom:ProfilePicture'), None)
                    if profile_picture_attr:
                        profile_picture_url = profile_picture_attr

            except Exception as e:
                print(f"Error retrieving user from Cognito: {str(e)}")

            # Fetch product details if available
            if product_id:
                prod_response = products_table.query(
                    IndexName='SK-PRODUCT-index',
                    KeyConditionExpression='SK = :sk AND PRODUCT = :product',
                    ExpressionAttributeValues={
                        ':sk': product_id,
                        ':product': 'product'
                    }
                )
                if prod_response['Items']:
                    product_details = prod_response['Items'][0]

            convo_details = {
                'ConversationID': conversation_sk,  # The SK of the conversation
                "LastUpdated": last_updated_sk,  # The SK of the latest message for this conversation
                'OtherParticipant': other_participant_id,
                'ProductDetails': product_details if product_details else 'No product details found',
                'ProfilePictureURL': profile_picture_url,  # Set to default or fetched value
            }

            conversations_with_products.append(convo_details)

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(conversations_with_products, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
