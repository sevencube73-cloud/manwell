import VariantAttribute from '../models/VariantAttribute.js';

// @desc    Create new variant attribute
// @route   POST /api/variant-attributes
// @access  Admin
export const createAttribute = async (req, res) => {
    try {
        const { name, values, displayOrder } = req.body;

        if (!name || !values || !Array.isArray(values)) {
            return res.status(400).json({ message: 'Name and values array are required' });
        }

        // Check if attribute with same name already exists
        const existingAttribute = await VariantAttribute.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingAttribute) {
            return res.status(400).json({ message: 'Attribute with this name already exists' });
        }

        const attribute = new VariantAttribute({
            name,
            values,
            displayOrder: displayOrder || 0,
            status: 'active'
        });

        await attribute.save();

        res.status(201).json({
            success: true,
            message: 'Variant attribute created successfully',
            attribute
        });
    } catch (error) {
        console.error('createAttribute error:', error);
        res.status(500).json({ message: 'Error creating variant attribute', error: error.message });
    }
};

// @desc    Get all variant attributes
// @route   GET /api/variant-attributes
// @access  Public
export const getAllAttributes = async (req, res) => {
    try {
        const { status } = req.query;

        const filter = {};
        if (status) {
            filter.status = status;
        }

        const attributes = await VariantAttribute.find(filter).sort({ displayOrder: 1, name: 1 });

        res.json({
            success: true,
            count: attributes.length,
            attributes
        });
    } catch (error) {
        console.error('getAllAttributes error:', error);
        res.status(500).json({ message: 'Error fetching variant attributes', error: error.message });
    }
};

// @desc    Get single variant attribute by ID
// @route   GET /api/variant-attributes/:id
// @access  Public
export const getAttributeById = async (req, res) => {
    try {
        const attribute = await VariantAttribute.findById(req.params.id);

        if (!attribute) {
            return res.status(404).json({ message: 'Variant attribute not found' });
        }

        res.json({
            success: true,
            attribute
        });
    } catch (error) {
        console.error('getAttributeById error:', error);
        res.status(500).json({ message: 'Error fetching variant attribute', error: error.message });
    }
};

// @desc    Update variant attribute
// @route   PUT /api/variant-attributes/:id
// @access  Admin
export const updateAttribute = async (req, res) => {
    try {
        const { name, values, status, displayOrder } = req.body;

        const attribute = await VariantAttribute.findById(req.params.id);

        if (!attribute) {
            return res.status(404).json({ message: 'Variant attribute not found' });
        }

        // If name is being changed, check for duplicates
        if (name && name !== attribute.name) {
            const existingAttribute = await VariantAttribute.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: req.params.id }
            });

            if (existingAttribute) {
                return res.status(400).json({ message: 'Attribute with this name already exists' });
            }

            attribute.name = name;
        }

        if (values !== undefined) attribute.values = values;
        if (status !== undefined) attribute.status = status;
        if (displayOrder !== undefined) attribute.displayOrder = displayOrder;

        await attribute.save();

        res.json({
            success: true,
            message: 'Variant attribute updated successfully',
            attribute
        });
    } catch (error) {
        console.error('updateAttribute error:', error);
        res.status(500).json({ message: 'Error updating variant attribute', error: error.message });
    }
};

// @desc    Delete variant attribute
// @route   DELETE /api/variant-attributes/:id
// @access  Admin
export const deleteAttribute = async (req, res) => {
    try {
        const attribute = await VariantAttribute.findById(req.params.id);

        if (!attribute) {
            return res.status(404).json({ message: 'Variant attribute not found' });
        }

        // TODO: Check if any products are using this attribute before deletion
        // For now, we'll just delete it

        await attribute.deleteOne();

        res.json({
            success: true,
            message: 'Variant attribute deleted successfully'
        });
    } catch (error) {
        console.error('deleteAttribute error:', error);
        res.status(500).json({ message: 'Error deleting variant attribute', error: error.message });
    }
};

// @desc    Add value to existing attribute
// @route   POST /api/variant-attributes/:id/values
// @access  Admin
export const addAttributeValue = async (req, res) => {
    try {
        const { value } = req.body;

        if (!value) {
            return res.status(400).json({ message: 'Value is required' });
        }

        const attribute = await VariantAttribute.findById(req.params.id);

        if (!attribute) {
            return res.status(404).json({ message: 'Variant attribute not found' });
        }

        if (attribute.values.includes(value)) {
            return res.status(400).json({ message: 'Value already exists in this attribute' });
        }

        attribute.values.push(value);
        await attribute.save();

        res.json({
            success: true,
            message: 'Value added successfully',
            attribute
        });
    } catch (error) {
        console.error('addAttributeValue error:', error);
        res.status(500).json({ message: 'Error adding attribute value', error: error.message });
    }
};

// @desc    Remove value from attribute
// @route   DELETE /api/variant-attributes/:id/values/:value
// @access  Admin
export const removeAttributeValue = async (req, res) => {
    try {
        const { value } = req.params;

        const attribute = await VariantAttribute.findById(req.params.id);

        if (!attribute) {
            return res.status(404).json({ message: 'Variant attribute not found' });
        }

        attribute.values = attribute.values.filter(v => v !== value);
        await attribute.save();

        res.json({
            success: true,
            message: 'Value removed successfully',
            attribute
        });
    } catch (error) {
        console.error('removeAttributeValue error:', error);
        res.status(500).json({ message: 'Error removing attribute value', error: error.message });
    }
};
