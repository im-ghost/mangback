const supabase = require('../config/supabase');
const User = require('../models/User');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    // Create a unique name: userId-timestamp.pdf
    const fileName = `${req.user.id}-${Date.now()}.pdf`;

    // 1. Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file.buffer, {
        contentType: 'application/pdf',
        upsert: true // Overwrites if the file already exists
      });

    if (error) throw error;

    // 2. Generate the Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // 3. Save the URL to the User's MongoDB profile
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumeUrl: publicUrl },
      { new: true }
    );

    res.status(200).json({
      message: 'Resume uploaded successfully!',
      url: publicUrl,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};