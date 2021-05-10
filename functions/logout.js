module.exports = function(app) {  //receiving "app" instance
    app.route('/logout')
        .get(getA)
        .post(postA);
}

function getA(req, res) {
    if(!req.session)
    {
        return res.status(401).send();
    }
    else
    {
      res.clearCookie();
      req.session.destroy(() => {
        return res.render("logout.ejs");        
       });
      
    } 
}
function   postA(req, res) {
}

