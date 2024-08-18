# This AWS Lambda function sends a search request to an OpenSearch domain (formerly Amazon Elasticsearch Service) 
# based on the query parameters provided in the API Gateway event. 
# It constructs a search query with filters like query_text, category, price range, upload date, 
# size, warranty, and condition. The function logs the received event, constructed query, 
# and the response for debugging purposes, and it returns the search results as the response body.

import http.client
import json
import base64

def lambda_handler(event, context):
    # Log the incoming event for debugging
    print("Received event:", json.dumps(event, indent=2))
    
    # Endpoint for your OpenSearch domain (without https://)
    endpoint = 'search-aubstudentsmarketplace1-4qqok3a4lrr2qgx2f4tuppxoxm.aos.eu-north-1.on.aws'
    query_params = event.get('queryStringParameters', {})
    query_text = query_params.get('query_text', '')
    category = query_params.get('category', '')
    min_price = query_params.get('min_price', '')
    max_price = query_params.get('max_price', '')
    upload_date = query_params.get('upload_date', '')
    size = query_params.get('size', '')
    warranty = query_params.get('warranty', '')
    condition = query_params.get('condition', '')

    # Log the parsed query parameters
    print(f"Query Text: {query_text}, Category: {category}, Min Price: {min_price}, Max Price: {max_price}")
    print(f"Upload Date: {upload_date}, Size: {size}, Warranty: {warranty}, Condition: {condition}")

    # Credentials
    username = 'AUBMarketPlace'
    password = 'Team17_123'
    # Base64 encode the credentials
    credentials = f'{username}:{password}'
    encoded_credentials = base64.b64encode(credentials.encode()).decode('utf-8')
   
    # Construct the query based on provided filters
    must_clauses = []

    if query_text:
        must_clauses.append({
            "multi_match": {
                "query": query_text,
                "fields": ["Title", "PK"]
            }
        })
    
    if category:
        must_clauses.append({
            "term": {
                "PK.keyword": category
            }
        })

    if min_price and max_price:
        must_clauses.append({
            "range": {
                "Price": {
                    "gte": min_price,
                    "lte": max_price
                }
            }
        })
    elif min_price:
        must_clauses.append({
            "range": {
                "Price": {
                    "gte": min_price
                }
            }
        })
    elif max_price:
        must_clauses.append({
            "range": {
                "Price": {
                    "lte": max_price
                }
            }
        })

    if upload_date:
        must_clauses.append({
            "range": {
                "UploadDate": {
                    "gte": upload_date
                }
            }
        })

    if size:
        must_clauses.append({
            "term": {
                "Size.keyword": size
            }
        })

    if warranty:
        must_clauses.append({
            "term": {
                "Warranty.keyword": warranty
            }
        })

    if condition:
        must_clauses.append({
            "term": {
                "Condition.keyword": condition
            }
        })

    # Log the constructed must clauses
    print("Constructed must_clauses:", json.dumps(must_clauses, indent=2))

    # Construct the body for the search request
    body = json.dumps({
        "query": {
            "bool": {
                "must": must_clauses
            }
        }
    })

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {encoded_credentials}'
    }

    # Log the constructed HTTP request body
    print("Request body:", body)

    # Send the request
    conn = http.client.HTTPSConnection(endpoint, 443)
    method = 'GET'
    url = '/users/_search'
    conn.request(method, url, body, headers)
    response = conn.getresponse()

    # Read and format the response
    data = response.read().decode()
    conn.close()

    # Log the response status and data
    print(f"Response status: {response.status}")
    print("Response data:", data)

    return {
        'statusCode': response.status,
        'body': data
    }
