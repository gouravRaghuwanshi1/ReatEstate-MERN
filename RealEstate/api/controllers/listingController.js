const errorHandler = require('../utils/error.js')
const Listing = require('../models/listingModel.js')

exports.createListing = async (req, res, next) => {
    try {
        console.log("inside listing ", req.body);
        const listing = await Listing.create(req.body);
        return res.status(201).json(listing);
    } catch (err) {
        console.log(err)
        next(err);
    }
}

exports.deleteListing = async (req, res, next) => {
    try {
       
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return next(errorHandler(404, "Listing Not Found"));
        }
        if (req.user.id !== listing.userRef) {
            return next(errorHandler(401, "You can only delete Your own listing "));
        }

        await Listing.findByIdAndDelete(req.params.id);
        return res.status(201).json("Listing deleted SuccessFully");
    } catch (err) {
        console.log(err)
        next(err);
    }
}

exports.updateListing = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return next(errorHandler(404, "Listing Not Found"));
        }
        if (req.user.id !== listing.userRef) {
            return next(errorHandler(401, "You can only Update Your own listing "));
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        return res.status(200).json(updatedListing);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getListing = async (req, res, next) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ error: "No listing found for the given ID" });
        }

        return res.status(200).json(listing);

    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.getListings = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 9;
        const startIndex = parseInt(req.query.startIndex) || 0;
        let offer = req.query.offer;
        if (offer === undefined || offer === 'false') {
            offer = { $in: [false, true] };
        }
        else offer=true;

        let furnished = req.query.furnished;
        if (furnished === undefined || furnished === 'false') {
            furnished = { $in: [false, true] };
        }
        let parking = req.query.parking;
        if (parking === undefined || parking === 'false') {
            parking = { $in: [false, true] };
        }
        let type = req.query.type;
        if (type === undefined || type === 'all') {
            type = { $in: ['sale', 'rent'] };
        }
        const searchTerm = req.query.searchTerm || '';
        const sort = req.query.sort || 'createdAt';
        const order = req.query.order || 'desc';

        const listings = await Listing.find({
            name: {
                $regex: searchTerm, $options: 'i'
            },
            offer,
            furnished,
            parking,
            type,
        }).sort(
            { [sort]: order }
        ).limit(limit).skip(startIndex);

        return res.status(200).json(listings);

    } catch (err) {
        console.error(err);
        next(err);
    }
};
