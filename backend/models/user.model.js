import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Defining the schema for our user collection
const userSchema = new mongoose.Schema(
    // strings inside [] are error messages if condition is false
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
        },
        cartItems: [
            {
                quantity: {
                    type: Number,
                    default: 1,
                },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                }, // Users need to store ids of products they have ordered
            },
        ],
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Pre-save hook to hash password before saving to database
userSchema.pre("save", async function (next) {
    // If password isn't changed, go to next function whatever it is
    if (!this.isModified("password")) {
        return next();
    }

    try {
        // Password goes through a hash function to be saved completely different in the db so its not compromised
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
})

// Compares password entered with hashed password, if they are same only then allowed login
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
}

// Creating a model called User along with collection "users" with the userSchema
// This should be below everything else otherwise hooks won't work
const User = mongoose.model("User", userSchema);

export default User;