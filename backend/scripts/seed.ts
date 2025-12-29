import mongoose from 'mongoose';
import { config } from 'dotenv';
import { User } from '../src/modules/auth/user.model';
import { Supplier } from '../src/modules/supplier/supplier.model';
import { Product } from '../src/modules/product/product.model';
import { Variant } from '../src/modules/variant/variant.model';

config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dropship');
        console.log('📦 Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Supplier.deleteMany({});
        await Product.deleteMany({});
        await Variant.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@dropshipcore.com',
            password: 'admin123', // Will be hashed automatically
            role: 'ADMIN',
        });
        console.log('👤 Created admin user');

        // Create demo user
        await User.create({
            name: 'John Doe',
            email: 'user@example.com',
            password: 'user123',
            role: 'USER',
        });
        console.log('👤 Created demo user');

        // Create suppliers
        const supplier1 = await Supplier.create({
            name: 'TechGear Wholesale',
            type: 'INTERNATIONAL',
            apiEndpoint: 'https://api.techgear.com/v1',
            contactEmail: 'sales@techgear.com',
            contactPhone: '+1-555-0100',
            isActive: true,
        });

        const supplier2 = await Supplier.create({
            name: 'Fashion Hub BD',
            type: 'LOCAL',
            apiEndpoint: 'https://api.fashionhub.bd/v1',
            contactEmail: 'contact@fashionhub.bd',
            contactPhone: '+880-1700-000000',
            isActive: true,
        });
        console.log('🏪 Created suppliers');

        // Create products
        const products = [
            {
                title: 'Wireless Bluetooth Headphones',
                description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Crystal clear sound quality and comfortable over-ear design perfect for music lovers and professionals.',
                supplierId: supplier1._id,
                category: 'Electronics',
                images: [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
                ],
                isActive: true,
            },
            {
                title: 'Smart Fitness Watch',
                description: 'Track your fitness goals with this advanced smartwatch. Features heart rate monitoring, GPS, sleep tracking, and 100+ sport modes. Water-resistant up to 50 meters.',
                supplierId: supplier1._id,
                category: 'Electronics',
                images: [
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
                    'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500'
                ],
                isActive: true,
            },
            {
                title: 'Premium Cotton T-Shirt',
                description: 'Super soft 100% organic cotton t-shirt. Breathable, durable, and perfect for everyday wear. Available in multiple colors and sizes.',
                supplierId: supplier2._id,
                category: 'Fashion',
                images: [
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
                    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500'
                ],
                isActive: true,
            },
            {
                title: 'Leather Messenger Bag',
                description: 'Handcrafted genuine leather messenger bag. Spacious interior with multiple compartments for laptop, documents, and accessories. Perfect for work or travel.',
                supplierId: supplier2._id,
                category: 'Accessories',
                images: [
                    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
                    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500'
                ],
                isActive: true,
            },
            {
                title: 'Wireless Gaming Mouse',
                description: 'High-precision wireless gaming mouse with RGB lighting. 16000 DPI sensor, programmable buttons, and ergonomic design for extended gaming sessions.',
                supplierId: supplier1._id,
                category: 'Electronics',
                images: [
                    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
                    'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=500'
                ],
                isActive: true,
            },
            {
                title: 'Minimalist Wallet',
                description: 'Slim RFID-blocking wallet with space for 8 cards and cash. Premium leather construction with sleek, modern design.',
                supplierId: supplier2._id,
                category: 'Accessories',
                images: [
                    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
                    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'
                ],
                isActive: true,
            },
        ];

        const createdProducts = await Product.insertMany(products);
        console.log(`📦 Created ${createdProducts.length} products`);

        // Create variants for each product
        const variants = [
            // Headphones variants
            { productId: createdProducts[0]._id, sku: 'HEAD-BLK-001', attributes: { color: 'Black' }, supplierPrice: 45.00, sellingPrice: 89.99, availableQty: 50 },
            { productId: createdProducts[0]._id, sku: 'HEAD-WHT-001', attributes: { color: 'White' }, supplierPrice: 45.00, sellingPrice: 89.99, availableQty: 30 },
            { productId: createdProducts[0]._id, sku: 'HEAD-BLU-001', attributes: { color: 'Blue' }, supplierPrice: 45.00, sellingPrice: 89.99, availableQty: 25 },

            // Fitness Watch variants
            { productId: createdProducts[1]._id, sku: 'WATCH-BLK-S', attributes: { color: 'Black', size: 'Small' }, supplierPrice: 89.00, sellingPrice: 149.99, availableQty: 20 },
            { productId: createdProducts[1]._id, sku: 'WATCH-BLK-L', attributes: { color: 'Black', size: 'Large' }, supplierPrice: 89.00, sellingPrice: 149.99, availableQty: 35 },
            { productId: createdProducts[1]._id, sku: 'WATCH-SLV-S', attributes: { color: 'Silver', size: 'Small' }, supplierPrice: 89.00, sellingPrice: 149.99, availableQty: 15 },
            { productId: createdProducts[1]._id, sku: 'WATCH-SLV-L', attributes: { color: 'Silver', size: 'Large' }, supplierPrice: 89.00, sellingPrice: 149.99, availableQty: 40 },

            // T-Shirt variants
            { productId: createdProducts[2]._id, sku: 'TSHIRT-BLK-S', attributes: { color: 'Black', size: 'S' }, supplierPrice: 8.00, sellingPrice: 19.99, availableQty: 100 },
            { productId: createdProducts[2]._id, sku: 'TSHIRT-BLK-M', attributes: { color: 'Black', size: 'M' }, supplierPrice: 8.00, sellingPrice: 19.99, availableQty: 150 },
            { productId: createdProducts[2]._id, sku: 'TSHIRT-BLK-L', attributes: { color: 'Black', size: 'L' }, supplierPrice: 8.00, sellingPrice: 19.99, availableQty: 120 },
            { productId: createdProducts[2]._id, sku: 'TSHIRT-WHT-S', attributes: { color: 'White', size: 'S' }, supplierPrice: 8.00, sellingPrice: 19.99, availableQty: 80 },
            { productId: createdProducts[2]._id, sku: 'TSHIRT-WHT-M', attributes: { color: 'White', size: 'M' }, supplierPrice: 8.00, sellingPrice: 19.99, availableQty: 140 },
            { productId: createdProducts[2]._id, sku: 'TSHIRT-WHT-L', attributes: { color: 'White', size: 'L' }, supplierPrice: 8.00, sellingPrice: 19.99, availableQty: 110 },

            // Messenger Bag variants
            { productId: createdProducts[3]._id, sku: 'BAG-BRN-001', attributes: { color: 'Brown' }, supplierPrice: 65.00, sellingPrice: 129.99, availableQty: 25 },
            { productId: createdProducts[3]._id, sku: 'BAG-BLK-001', attributes: { color: 'Black' }, supplierPrice: 65.00, sellingPrice: 129.99, availableQty: 30 },

            // Gaming Mouse variants
            { productId: createdProducts[4]._id, sku: 'MOUSE-BLK-001', attributes: { color: 'Black', dpi: '16000' }, supplierPrice: 35.00, sellingPrice: 69.99, availableQty: 45 },
            { productId: createdProducts[4]._id, sku: 'MOUSE-WHT-001', attributes: { color: 'White', dpi: '16000' }, supplierPrice: 35.00, sellingPrice: 69.99, availableQty: 30 },

            // Wallet variants
            { productId: createdProducts[5]._id, sku: 'WALLET-BRN-001', attributes: { color: 'Brown' }, supplierPrice: 15.00, sellingPrice: 34.99, availableQty: 60 },
            { productId: createdProducts[5]._id, sku: 'WALLET-BLK-001', attributes: { color: 'Black' }, supplierPrice: 15.00, sellingPrice: 34.99, availableQty: 75 },
            { productId: createdProducts[5]._id, sku: 'WALLET-NVY-001', attributes: { color: 'Navy' }, supplierPrice: 15.00, sellingPrice: 34.99, availableQty: 50 },
        ];

        await Variant.insertMany(variants);
        console.log(`🎨 Created ${variants.length} product variants`);

        console.log('\n✅ Seed data created successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: 2 (1 admin, 1 customer)`);
        console.log(`   Suppliers: 2`);
        console.log(`   Products: ${createdProducts.length}`);
        console.log(`   Variants: ${variants.length}`);
        console.log('\n🔐 Login credentials:');
        console.log('   Admin: admin@dropshipcore.com / admin123');
        console.log('   User: user@example.com / user123');

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
