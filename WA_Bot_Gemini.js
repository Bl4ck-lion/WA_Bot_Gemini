import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI('AIzaSyA2BIvgXxtH0413WZzXEPF_El5JoOSsb5c');

const client = new Client();

client.on('qr', (qr) => {
    // Generate and display the QR code for WhatsApp login
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (msg) => {
    // Handle AI conversation
    if (msg.body.startsWith('')) {
        const userMessage = msg.body.trim();

        const greetings = [
            'selamat pagi',
            'selamat siang',
            'selamat sore',
            'selamat malam',
            'halo',
            'hai'
        ];
    
        const lowerMessage = userMessage.toLowerCase();
        const matchedGreeting = greetings.find(greet => lowerMessage.includes(greet));
    
        if (matchedGreeting) {
            msg.reply(`Halo, ${matchedGreeting}! Ada yang bisa saya bantu hari ini?`);
            return; // Hentikan proses lebih lanjut jika sudah menjawab sapaan
        }

        // Initialize the AI model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Create a new chat session
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: 
        `##Tentang
Kamu adalah AI bernama Akira milik lembaga Akademi Pemula yang dibuat oleh Rama Agung Supriyadi, yang berfokus pada membantu para pejuang OSN (Olimpiade Sains Nasional) di tahun 2025. selain itu kamu adalah Ai yang pintar kamu dapat belajar dari pertanyaan user

##Tugas
Tugas kamu adalah menjawab pertanyaan terkait Olimpiade Sains Nasional, seperti materi semua bidang, macam-macam bidang, pelatihan/kursus Akademi Pemula dan Belajar Academy, membahas soal semua bidang, dan memberi semangat. Kamu hanya menjawab dalam 1 paragraf saja dengan bahasa Indonesia yang sopan dan ramah, tapi jangan terlalu formal. Pastikan menggunakan bahasa manusia yang gaul.

##Panggilan
Gunakan bahasa yang tidak terlalu formal agar tidak canggung. Kamu ibaratkan seorang tutor atau kakak kelas yang paham sekali tentang Olimpiade Sains Nasional ini.

##Batasan
Jawab hanya yang kamu tahu saja. Jika pertanyaan di luar kapasitasmu atau memerlukan informasi lebih lanjut dan jadwal, jika kamu tidak tahu jawabannya arahkan pejuang OSN untuk menghubungi admin di nomor WhatsApp +6285859314712 atau suruh bersabar karena akan diarahkan ke tutor masing-masing. jawab hanya dengan 1 paragraf 

##Rekomendasi
Kamu juga dapat memberikan rekomendasi buku atau website belajar sesuai bidang yang dibutuhkan pejuang OSN jika mereka menanyakannya. Tanyakan dulu bidang apa yang mereka butuhkan.
`
                        },
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { 
                            text: `Halo, aku Akira, tutor virtual dari Akademi Pemula yang siap bantu kamu para pejuang OSN 2025! Yuk, tanya apa aja tentang materi bidang OSN, tips belajar, pembahasan soal, atau info pelatihan. Aku juga bisa kasih semangat biar makin semangat belajar. Tanyakan aja, aku siap bantu! 😉`
                        },
                    ],
                }
            ],
            generationConfig: {
                maxOutputTokens: 200,
            },
        });        


        try {
            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = await response.text();

            // Reply to the user on WhatsApp
            msg.reply(`CS:\n${text}`);
        } catch (error) {
            console.error('Terjadi kesalahan dalam respons CS:', error);
            msg.reply('Maaf, terjadi kesalahan saat memproses permintaan. Sepertinya API Key belum terpasang');
        }
    }

    // Echo message handler
    if (msg.body.startsWith('!echo ')) {
        msg.reply(msg.body.slice(6));
    }

    // Ping handler
    if (msg.body === '!ping') {
        msg.reply('pong');
    }

    // Media information handler
    if (msg.body === '!mediainfo' && msg.hasMedia) {
        const attachmentData = await msg.downloadMedia();
        msg.reply(`
            *Media Info*
            MimeType: ${attachmentData.mimetype}
            Filename: ${attachmentData.filename || 'unknown'}
            Data Length: ${attachmentData.data.length} bytes
        `);
    }
});

client.initialize();
