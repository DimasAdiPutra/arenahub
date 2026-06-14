const mongoose = require('mongoose')
const slugify = require('slugify')

const CategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Nama kategori wajib diisi'],
			unique: true, // Mencegah nama kategori ganda (misal: 'Futsal' dua kali)
			trim: true,
		},
		slug: {
			type: String,
			lowercase: true,
			unique: true,
		},
	},
	{ timestamps: true },
)

CategorySchema.pre('save', async function() {
  // Jika field 'name' tidak mengalami perubahan, langsung keluar dari fungsi
  if (!this.isModified('name')) return;
  
  // Ubah "Studio Podcast" menjadi "studio-podcast" secara otomatis
  this.slug = slugify(this.name, { 
    lower: true,   // Mengubah semua huruf menjadi kecil (lowercase)
    strict: true   // Menghapus karakter khusus selain huruf, angka, dan strip (-)
  });
});

module.exports = mongoose.model('Category', CategorySchema)
