# Grinz

Facial expression detector sample app. Using Webpack, Google Vision, React.

## Frontend

Client-side app based on React & Webpack. Run dev server with:

```sh
cd frontend/
export run dev-server
```

## Image Proxy

Proxy to Google Cloud Vision API, holds Google API credentials. Get an API key in the 
[Google Developers Console](https://console.developers.google.com/apis), then:

```sh
cd imgproxy/
export VISION_API_KEY={my_vision_api_key}
npm run dev-server
```
