# Name Hacker
A neural network based name generator that uses [Tensorflow.js](http://js.tensorflow.org) to run inference right in the browser. Try out the [demo](https://namehacker.net)!

### Features
* Generates names based on a root word given by the user
* Quickly sift through large number of variants
* Trained on 1 million+ names from the US trademarks database for a large variety of names
* Also checks for domain availability

### Usage
The app will take a couple of seconds (on a decent connection) to load the model (~3MB). Enter a root word (e.g. chocoloate) and tap on the 'HACK IT' button to generate unique names. Hold the button for continuous generation (doesn't work on mobile browsers). With the button held down, move the pointer right to speed up generation. Once you release the button, the app with check for domain availability (.com) within 1 second and show the result. You can then click the resulting name to the registration page at GoDaddy.

### Running and Deploying
1. Clone this repository
2. Setup the dependencies: `npm install`
3. Run the development server: `npm start`
4. To enable domain checking you need to set up the URL that this webapp can call into. Create a .env file and make an entry like this: `REACT_APP_DOMAIN_CHECK_URL=<your URL>`. To help you set this service I have created another [project](https://github.com/kolloldas/godaddy-proxy) that can be run as a Google Cloud Function to query for domains. Please refer this project on how to set it up
5. Build the project: `npm run build` - All the required files will be generated inside the *build* folder.
6. Deploy the generated files in a static server. I found it easy and cheap to deploy on Firebase Hosting. Please read their [guide](https://firebase.google.com/docs/hosting/deploying) on how to do so.

### Model and Dataset
In its core Name Hacker is simple encoder-decoder network into which we add a bit of gaussian noise after the encoding. The model was trained on dataset built from the freely available US trademarks database. A dictionary was used to find words sharing common prefixes with the trademarks. Such words were the inputs and the trademarks the targets. This formulation allows for more variations in the output. During inference we sample from the decoder outputs and also add gaussian noise to the encoder state.

### Tensorflow and Tensorflow.js
The model was trained on Tensorflow and its parameters extracted to run on Tensorflow.js. The tutorials provided are fairly clear on how to do this. The encoder-decoder model was coded in Typescript using the functions provided by Tensorflow.js. The best part is that it uses webgl in the browser to run some of the ops as shaders leading to speedup in performance. Unfortunately it does not work properly in Safari. I'm trying to get to the root of the problem and hopefully fix this soon.

### Other components used
The webapp uses [React](http://reactjs.org) for the UI and [MobX](https://mobx.js.org) for state management. Specifically it uses [TypeScript-React-Starter](https://github.com/Microsoft/TypeScript-React-Starter) boilerplate so it comes with all the powers of [create-react-app](https://github.com/facebookincubator/create-react-app). For styling it uses the slick [Material-UI-Next](https://material-ui-next.com/) library. For domain checking it makes a REST call to a tiny web service setup as Google Cloud Function. Please refer [GoDaddy Proxy](https://github.com/kolloldas/godaddy-proxy) for more details
