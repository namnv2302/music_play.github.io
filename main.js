/**
 * 1.Render songs
 * 2.Scroll top
 * 3.Play / pause / seek
 * 4.Cd rotate
 * 5.Next / prev
 * 6.Random
 * 7.Next / repeat when ended
 * 8.Active song
 * 9.Scroll active song into view
 * 10.Play song when click
 */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'NAM_PLAYER'

const player = $('.player')
const playlist = $('.playlist');
const heading = $('.header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Ái Nộ',
            singer: 'Masew, Khôi Vũ',
            path: './assets/music/song1.mp3',
            img: './assets/img/song1.jpg'
        },
        {
            name: 'Cưới Thôi',
            singer: 'Masew, Masiu, B Ray',
            path: './assets/music/song2.mp3',
            img: './assets/img/song2.jpg'
        },
        {
            name: 'Độ Tộc 2',
            singer: 'Masew, Độ mixi, Phúc Du, Pháo',
            path: './assets/music/song3.mp3',
            img: './assets/img/song3.jpg'
        },
        {
            name: 'Muộn Rồi Mà Sao Còn',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/song4.mp3',
            img: './assets/img/song4.jpg'
        },
        {
            name: 'Đế Vương',
            singer: 'Đình Dũng, ACV',
            path: './assets/music/song5.mp3',
            img: './assets/img/song5.jpg'
        },
        {
            name: 'bao tiền một mớ bình yên?',
            singer: '14 Casper, Bon',
            path: './assets/music/song6.mp3',
            img: './assets/img/song6.jpg'
        },
        {
            name: 'Don\'t Break My Heart',
            singer: 'Binz x Touliver',
            path: './assets/music/song7.mp3',
            img: './assets/img/song7.jpg'
        }
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map(function(song, index) {
            return `
            <div class="song ${index === app.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.img}');">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fa-solid fa-ellipsis"></i>
                </div>
            </div>`
        }) 
        playlist.innerHTML = htmls.join('');
    },

    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xu ly CD quay / dung
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })

        cdThumbAnimate.pause()

        // Xu ly phong to / thu nho CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0 + 'px'
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xu ly khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            }else {
                audio.play()
            }
        }

        // Khi song duoc play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song bi pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tien do bai hat thay doi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent =  audio.currentTime / audio.duration * 1000
                progress.value = progressPercent
            }
        }

        // Xu ly khi tua song
        progress.onchange = function(e) {
            const seekTime = e.target.value * audio.duration / 1000
            audio.currentTime = seekTime 
        }

        // Khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play() 
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play() 
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi random song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xu ly khi repeat song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xu ly next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lang nghe hanh vi click vao playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')) {
                // Xu ly click vao song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                // Xu ly khi click vao option
                if(e.target.closest('.option')) {

                }
            }
        }
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while(newIndex === this.currentIndex)
        
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function() {
        // Gan cau hinh vao ung dung
        this.loadConfig()

        // Dinh nghia cac thuoc tinh cho object 
        this.defineProperties()

        // Lang nghe / xu ly cac su kien
        this.handleEvents()

        // Tai thong tin bai hat dau tien vao UI khi chay
        this.loadCurrentSong()

        // Render playlist
        this.render()

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start();