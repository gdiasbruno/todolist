//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-bruno:teste123@cluster0-dnbgb.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const gym = new Item({
  name: "Gym"
});

const write = new Item({
  name: "Write"
});

const gusttavo = new Item({
  name: "Gusttavo"
});

const defaultItems = [gym, write, gusttavo];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);


// Item.insertMany(defaultItems, function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.error("success!")
//   }
// })



app.get("/", function(req, res) {

  Item.find(function(err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.error("success!")
        }
      });
      res.redirect("/")
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }


  });



});


app.get("/:customListName", function(req, res) {
  let route = _.capitalize(req.params.customListName);
  List.findOne({name:route}, function (err, foundList){
    if (!err) {
      if(!foundList) {
        //Create a new list
        const list = new List ({
          name: route,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+route)
      } else {
        // show an existing list
        res.render("list", {listTitle: foundList.name, newListItems:foundList.items})
      }
    }
  })
      });






app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName)
    })
  }



});

app.post("/delete", function(req, res) {
  const listName = req.body.listName

  if (listName === "Today") {
    Item.findByIdAndRemove(req.body.checkbox, function(err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    })

  } else {
    List.findOneAndUpdate({name: listName},{$pull:{items: {_id: req.body.checkbox}}}, function(err, foundList){
      if (!err) {
        res.redirect("/"+listName);
      }
    })
  }


})







app.get("/about", function(req, res) {
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
