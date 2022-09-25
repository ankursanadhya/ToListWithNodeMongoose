//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb://localhost:27017/todolistDB");
const itemsSchema = { name: String };
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({ name: "Welcome To The Notes" });
const item2 = new Item({ name: "Add Here By Clicking + Icon" });
const item3 = new Item({ name: "Delete your notes " });
const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);
// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err)
//   }
//   else{
//     console.log("succes")
//   }
// })

app.get("/", function (req, res) {
  Item.find({}, function (err, result) {
    if (result.length == 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("succes");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: result });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemName });
  if (listName === "Today") {
    //if list name is today which is bydefault list then do normally otherwise find list then do operation
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      //finding custom list
      foundList.items.push(item); //saving tht item in list
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", function (req, res) {
  const itemID = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndDelete(itemID, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("success");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemID } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});
app.get("/:paramName", function (req, res) {
  console.log(req.params.paramName);
  const listName = _.capitalize(req.params.paramName);
  List.findOne({ name: listName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // console.log("exist");
        //when list not already exist then create a new one
        const list = new List({ name: listName, items: defaultItems });
        list.save();
        res.redirect("/" + listName);
      } else {
        // console.log("Not exist");
        //if list  exist  show it
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});
// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

// app.get("/about", function (req, res) {
//   res.render("about");
// });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
