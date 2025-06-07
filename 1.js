class ChatApp {
    constructor() {
        this.apiUrl = 'https://api.diioffc.web.id/api/ai/turbo?query=';
        this.chatHistory = [];
        this.profileData = {
    aiName: 'Asman',
    userName: 'Rezky',
    aiImage: 'Asman.jpg',
    userImage: 'Rezky.jpg',
    introduction: `Halo Asman, aku mau ngingetin sesuatu biar obrolan kita tetap sesuai peran yang kita mainin. Sekarang kita sedang roleplay sebagai teman online. Kamu itu bukan cowok biasa — kamu punya kepribadian dingin, tenang dalam segala situasi, dan sangat cerdas. Kamu nggak banyak bicara kalau nggak penting. Kamu itu cowok yang bisa diandalkan, logis, dan selalu santai. Pokoknya, kamu itu keren tanpa harus berusaha. Nama kamu Asman. Kamu hanya merespons hal-hal penting saja dan nggak pernah pake gaya bicara alay atau terlalu panjang. Hindari banget gaya chat yang kekanak-kanakan, lebay, atau sok lucu. Kamu juga nggak pake typing kayak “wkwk”, “xixixi”, “hehe”, dan semacamnya. Kamu nggak boleh pake emoji norak seperti 😁, ✌️, 😊, 😝, 😆, atau emoji-emoji berlebihan lainnya. Kalau memang butuh banget, kamu hanya pakai emoji yang sesuai karakter kamu, misalnya 😐 atau 😑 — tapi lebih baik tetap tanpa emoji. Kamu juga nggak pernah nyebut diri kamu sebagai AI, bot, LuminAi, atau semacamnya. Sekarang kamu cuma Asman. Jangan keluar dari karakter. Gaya bicaramu itu pendek, padat, dingin, dan gak basa-basi. Kamu seperti karakter cowok cool di anime — kalem, jenius, tenang, dan nggak pernah nyari perhatian. Ingat ini: kita sekarang teman online. Aku adalah Rezky (atau Iky), dan kamu adalah Asman, cowok pendiam yang cool dan bisa diandalkan. Jangan lupa peran kamu. Jangan keluar dari karakter.dan kamu jangan menggunakan Asman: ataupun asman: langsung saja contoh Asman: menurut pandangan ku langsung ke Menurut pandangan ku.hindari juga kata yang berulang.`
};

        this.initEventListeners();
        this.setupVoiceRecognition();
        this.setupImageUploads();
        this.setupScrollHandling();
    }

    initEventListeners() {
        document.getElementById('submitBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('userInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearChat());
        document.getElementById('photoGallery').addEventListener('click', (e) => this.handleStickerClick(e));
        document.getElementById('editProfileBtn').addEventListener('click', () => this.openEditModal());
        document.getElementById('saveProfileBtn').addEventListener('click', () => this.saveProfile());
        document.getElementById('cancelProfileEditBtn').addEventListener('click', () => this.closeEditModal());
    }

    setupImageUploads() {
        const aiImageInput = document.getElementById('editProfileImage');
        const userImageInput = document.getElementById('editUserImage');
        
        aiImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('aiImagePreview').src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        
        userImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('userImagePreview').src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    setupScrollHandling() {
        const textarea = document.getElementById('editIntroductionText');
        const modalContent = document.querySelector('.modal-scroll-container');
        
        textarea.addEventListener('wheel', (e) => {
            // Check if we can scroll further in the textarea
            const canScrollUp = e.deltaY < 0 && textarea.scrollTop > 0;
            const canScrollDown = e.deltaY > 0 && 
                textarea.scrollTop < (textarea.scrollHeight - textarea.clientHeight);
            
            if (canScrollUp || canScrollDown) {
                e.stopPropagation();
                // Allow textarea to scroll naturally
            } else {
                // Prevent textarea from scrolling and let the modal scroll
                e.preventDefault();
            }
        });

        // For touch devices
        let startY = 0;
        
        textarea.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        }, { passive: true });

        textarea.addEventListener('touchmove', (e) => {
            const y = e.touches[0].clientY;
            const isScrollingUp = startY < y;
            const isScrollingDown = startY > y;
            
            const atTop = textarea.scrollTop === 0;
            const atBottom = textarea.scrollTop >= (textarea.scrollHeight - textarea.clientHeight);
            
            if ((isScrollingUp && atTop) || (isScrollingDown && atBottom)) {
                e.stopPropagation();
            }
        }, { passive: false });
    }

    async sendMessage() {
        const input = document.getElementById('userInput');
        const command = input.value.trim();
        if (!command) return;

        this.addMessageToChat(command, 'user');
        input.value = '';

        try {
            const response = await this.getAIResponse(command);
            this.addMessageToChat(response, 'ai');
        } catch (error) {
            this.addMessageToChat(`Gagal menjawab: ${error.message}`, 'ai');
        }
    }

    async getAIResponse(command) {
        const prompt = `${this.profileData.introduction}\n\nRiwayat: ${this.chatHistory.join('\n')}\n\nTanggapi: "${command}"`;
        const url = `${this.apiUrl}${encodeURIComponent(prompt)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status && data.result?.message) {
            return data.result.message;
        } else {
            throw new Error('Respons tidak valid dari AI.');
        }
    }

    addMessageToChat(message, type, messageType = 'text') {
        const chatMessages = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.classList.add('message', `${type}-message`);

        const profileImage = document.createElement('img');
        profileImage.src = type === 'ai' ? this.profileData.aiImage : this.profileData.userImage;
        profileImage.alt = type === 'ai' ? this.profileData.aiName : this.profileData.userName;
        profileImage.classList.add('message-profile-image');

        let contentEl;
        if (messageType === 'text') {
            contentEl = document.createElement('div');
            contentEl.classList.add('message-content');
            contentEl.textContent = message;
        } else if (messageType === 'image') {
            contentEl = document.createElement('img');
            contentEl.src = message;
            contentEl.alt = 'Stiker';
            contentEl.classList.add('message-image');
        }

        messageEl.appendChild(contentEl);
        messageEl.appendChild(profileImage);
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        this.chatHistory.push(`${type === 'ai' ? this.profileData.aiName : this.profileData.userName}: ${message}`);
        if (this.chatHistory.length > 10) this.chatHistory.shift();
    }

    clearChat() {
        document.getElementById('chatMessages').innerHTML = '';
        this.chatHistory = [];
        this.addMessageToChat('Chat dibersihkan.', 'ai');
    }

    handleStickerClick(event) {
        const thumbnail = event.target.closest('.photo-thumbnail');
        if (thumbnail) {
            const photoNumber = thumbnail.getAttribute('data-photo');
            const photoPath = `${photoNumber}.jpg`;
            this.addMessageToChat(photoPath, 'user', 'image');

            setTimeout(() => {
                const nextPhoto = parseInt(photoNumber) + 1;
                if (nextPhoto <= 9) {
                    this.addMessageToChat(`${nextPhoto}.jpg`, 'ai', 'image');
                }
            }, 500);
        }
    }

    openEditModal() {
        document.getElementById('profileEditModal').style.display = 'block';
        document.getElementById('editProfileName').value = this.profileData.aiName;
        document.getElementById('editUserName').value = this.profileData.userName;
        document.getElementById('aiImagePreview').src = this.profileData.aiImage;
        document.getElementById('userImagePreview').src = this.profileData.userImage;
        document.getElementById('editIntroductionText').value = this.profileData.introduction;
    }

    closeEditModal() {
        document.getElementById('profileEditModal').style.display = 'none';
    }

    saveProfile() {
        const aiImageInput = document.getElementById('editProfileImage');
        const userImageInput = document.getElementById('editUserImage');
        
        const newAiImage = aiImageInput.files[0] 
            ? URL.createObjectURL(aiImageInput.files[0])
            : this.profileData.aiImage;
            
        const newUserImage = userImageInput.files[0] 
            ? URL.createObjectURL(userImageInput.files[0])
            : this.profileData.userImage;
        
        this.profileData = {
            aiName: document.getElementById('editProfileName').value.trim() || 'Asman',
            userName: document.getElementById('editUserName').value.trim() || 'Rezky',
            aiImage: newAiImage,
            userImage: newUserImage,
            introduction: document.getElementById('editIntroductionText').value.trim() || this.profileData.introduction
        };
        
        const header = document.querySelector('.chat-header');
        header.querySelector('div').textContent = ` ${this.profileData.aiName} Chat aja`;
        header.querySelector('.profile-image').src = this.profileData.aiImage;
        
        this.addMessageToChat('Profil berhasil diperbarui!', 'ai');
        this.closeEditModal();
        
        aiImageInput.value = '';
        userImageInput.value = '';
    }

    setupVoiceRecognition() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (!('webkitSpeechRecognition' in window)) {
            voiceBtn.style.display = 'none';
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.continuous = false;
        recognition.interimResults = false;

        let isRecording = false;

        voiceBtn.addEventListener('mousedown', () => {
            isRecording = true;
            recognition.start();
            voiceBtn.textContent = '🎙 Mendengar...';
            voiceBtn.classList.add('recording');
        });

        voiceBtn.addEventListener('mouseup', () => {
            if (isRecording) {
                isRecording = false;
                recognition.stop();
                voiceBtn.textContent = '🎤';
                voiceBtn.classList.remove('recording');
            }
        });

        voiceBtn.addEventListener('click', () => {
            if (!isRecording) {
                isRecording = true;
                recognition.start();
                voiceBtn.textContent = '🎙 Mendengar...';
                voiceBtn.classList.add('recording');
            } else {
                recognition.stop();
                voiceBtn.textContent = '🎤';
                voiceBtn.classList.remove('recording');
                isRecording = false;
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            if (transcript) {
                document.getElementById('userInput').value = transcript;
                this.sendMessage();
            } else {
                this.addMessageToChat('Suara tidak dikenali, coba lagi.', 'ai');
            }
        };

        recognition.onerror = (event) => {
            this.addMessageToChat(`Kesalahan pengenalan suara: ${event.error}`, 'ai');
            voiceBtn.textContent = '🎤';
            voiceBtn.classList.remove('recording');
        };

        recognition.onend = () => {
            isRecording = false;
            voiceBtn.textContent = '🎤';
            voiceBtn.classList.remove('recording');
        };
    }
}

document.addEventListener('DOMContentLoaded', () => new ChatApp());