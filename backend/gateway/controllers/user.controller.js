const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json({ message: "User fetched successfully", user: req.user });
    } catch (error) {
        return res.status(500).json({ message: `Internal server error ${error}` });
    } 
} 
export { getCurrentUser }