// src/controllers/ownerController.js
let places = []; // in-memory places
let menus = {};  // keyed by placeId
let bundles = {}; // keyed by placeId

exports.createPlace = (req, res) => {
  const { name, location } = req.body;
  const place = { id: places.length + 1, ownerId: req.user.id, name, location };
  places.push(place);
  res.json({ message: 'Place created', place });
};

exports.getOwnerPlaces = (req, res) => {
  const ownerPlaces = places.filter(p => p.ownerId === req.user.id);
  res.json(ownerPlaces);
};

exports.addMenuItem = (req, res) => {
  const { placeId } = req.params;
  const { name, price } = req.body;
  if (!menus[placeId]) menus[placeId] = [];
  const item = { id: menus[placeId].length + 1, name, price };
  menus[placeId].push(item);
  res.json({ message: 'Menu item added', item });
};

exports.addBundle = (req, res) => {
  const { placeId } = req.params;
  const { name, items, price } = req.body;
  if (!bundles[placeId]) bundles[placeId] = [];
  const bundle = { id: bundles[placeId].length + 1, name, items, price };
  bundles[placeId].push(bundle);
  res.json({ message: 'Bundle added', bundle });
};
