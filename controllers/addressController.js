import Address from '../models/Address.js';

// Get all addresses for user
export const getAddresses = async (req, res) => {
  const addresses = await Address.find({ user: req.user.id });
  res.json(addresses);
};

// Add address
export const addAddress = async (req, res) => {
  const address = await Address.create({ ...req.body, user: req.user.id });
  res.status(201).json(address);
};

// Update address
export const updateAddress = async (req, res) => {
  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );
  if (!address) return res.status(404).json({ message: 'Address not found' });
  res.json(address);
};

// Delete address
export const deleteAddress = async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!address) return res.status(404).json({ message: 'Address not found' });
  res.json({ message: 'Address deleted' });
};