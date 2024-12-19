module.exports = (req, res) => {
    console.log("Test endpoint hit!");
    res.json({ message: "Hello from test endpoint!" });
};