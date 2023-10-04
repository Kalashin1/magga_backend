export const getTestingForm = (req, res) => {
  res.send(`
 <html>
 <head> </head>
 <body>
   <form method='post' enctype='multipart/form-data' action='/profile/photo'>
     <input type='file' name='image' />
     <button style='background-color: red' type='submit'>submit</button>
   </form>
 </body>
</html>`);
};
