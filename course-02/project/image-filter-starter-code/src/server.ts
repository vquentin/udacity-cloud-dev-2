import express, { Request, Response, response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @DONE IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  
  app.get( "/filteredimage/:image_url",
    async ( req: Request, res: Response ) => {
      let { url } = req.params;

      // check if url provided
      if ( !url ) {
        return res.status(400).send(`url is required`);
      }
      
      // check if url object can be created, if not assume there's an issue with the url provided
      // caveat: does not check if the url points to something, or an image
      const image_url: URL = new URL(url);
      if ( !image_url){
        return res.status(400).send(`url not valid`);
      }

      // call the filter function
      const filtered_path = await filterImageFromURL(image_url.toString());
      // check if server was able to process image
      if ( !filtered_path){
        return res.status(500).send(`url could not be processed`)
      }

      // use sendFile callback to delete the file locally
      return res.status(200).sendFile(filtered_path, function(err) {
        if (err) {
          console.log(err); // Check error if you want
        }
        deleteLocalFiles([filtered_path]);
      });

    });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();