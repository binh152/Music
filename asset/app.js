"use strict";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const player =$('.player');
const cd = $('.cd');

const headings = $('header h2');
const cdThumbMobile = $('.cd-thumb-mb');
const cdThumbPC = $('.cd-thumb-pc');
const audio = $('#audio');

const playBtn = $('.btn-toggle-play');
const progress = $('#progress');

const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist')

const PLAYER_STORAGE_KEY = 'Music';

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config:  JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Speechless',
            singer: 'Naomi Scott ',
            path: './asset/music/Naomi Scott - Speechless.mp3',
            image: './asset/img/speechless.jpg'
        },
        {
            name: 'Camila Cabello',
            singer: 'Havana',
            path: './asset/music/Havana Camila Cabello.mp3',
            image: './asset/img/havana.jpg',
        },
        {
            name: 'Lily',
            singer: 'Alan Walker',
            path: './asset/music/Lily - Alan.mp3',
            image: './asset/img/lily.jpg'
        },
        {
            name: 'Call You Mine ',
            singer: 'The Chainsmokers Bebe Rexha',
            path: './asset/music/Call You Mine - The Chainsmokers Bebe Rexha.mp3',
            image: './asset/img/call_you-mine.jpg'
        },
        {
            name: 'Phoenix ',
            singer: 'Chrissy Costanza, Cailin Russo',
            path: './asset/music/Phoenix.mp3',
            image: './asset/img/phoenix.jpg'
        },
        {
            name: 'RedLine',
            singer: 'AnnaYvette ',
            path: './asset/music/RedLine-AnnaYvette.mp3',
            image: './asset/img/redLine.jpg'
        },
        {
            name: 'Talk',
            singer: 'Khalid',
            path: './asset/music/Talk - Khalid.mp3',
            image: './asset/img/talk.jpg'
        },
        {
            name: 'Wolves',
            singer: 'Selena-Gomez',
            path: './asset/music/WolvesSelena-Gomez.mp3',
            image: './asset/img/wolves.jpg'
        },
    
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render: function(){
        const html = this.songs.map((song, index) =>{
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="content">
                        <div class="thumb" style="background-image: url('${song.image}')">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-v"></i>
                    </div>
                 </div>
              
            `
        })
        playlist.innerHTML = html.join('');
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong',{
            get: function(){
                return this.songs[this.currentIndex];
            }
            
        })
    },
    handleEvent: function(){
        // xử lý phóng to thu nhỏ cd
        const cdWidth = cd.offsetWidth;
        document.onscroll = function(){
            const scrollTop = document.documentElement.scrollTop || window.scrollY;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth >0 ? newCdWidth + 'px' : 0 ; 
           cd.style.opacity = newCdWidth / cdWidth; 
        }

        // xu lys Cd quay va dung 
        const cdThumbAnimate = cdThumbMobile.animate([
            {transform: 'rotate(360deg)'}
        ],
        {
            duration : 10000,
            iterations : Infinity
        })
        cdThumbAnimate.pause()

        // xử lý click play button
        playBtn.onclick = function() {
            if(app.isPlaying ){
                audio.pause();
            }else{
                audio.play();
            }
        }

        // khi song dc play
        audio.onplay = function() {
            app.isPlaying = true;
            player.classList.add('playing')
            cdThumbAnimate.play();
        }

        // khi song bi pause
        audio.onpause = function() {
            app.isPlaying = false;
            player.classList.remove('playing')
            cdThumbAnimate.pause();
        }

        // khi tien do bai hat thay doi 
        audio.ontimeupdate= function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }
        // khi tua song play
        progress.oninput = function(e) {
            const seekTime = audio.duration /100 * e.target.value;
            audio.currentTime = seekTime;
        }
        //  khi next song
        nextBtn.onclick = function() {
            if(app.isRandom){
                app.playRandomSong();
            }else{
                app.nextSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }
        //  khi pre song
        prevBtn.onclick = function() {
            if(app.isRandom){
                app.playRandomSong();
            }else{
                app.prevSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();

        }

        // xu ly random bat /tat
        randomBtn.onclick = function() {
           app.isRandom = !app.isRandom;
           app.setConfig('isRandom', app.isRandom);
           randomBtn.classList.toggle('active',app.isRandom);
        }

        // xu ly phat lai 1 song
        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat);
            
            repeatBtn.classList.toggle('active',app.isRepeat);

        }

        // xu ly khi audio ended 
        audio.onended = function() {
            if(app.isRepeat){
                audio.play();
            }else{

                nextBtn.click();
            }
        }

        // hanh vi click vao playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            const optionNode = e.target.closest('.option')

            // xu ly khi click vao song
           if(songNode || optionNode){
                
                if(songNode){
                    app.currentIndex = Number(songNode.dataset.index)
                    app.loadCurrentSong();
                    app.render()
                    audio.play();

                }
                if(optionNode){


                }
           }
        } 
    },
    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex< 0 ){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex>=this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function(){
        let newIndex 
        do{
            newIndex = Math.floor(Math.random()*this.songs.length)
        }while(newIndex ===this.currentIndex){
            this.currentIndex = newIndex;
            this.loadCurrentSong();
        }
    },

    scrollToActiveSong: function(){
        setTimeout(function(){
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block : 'center'
            })
        },200)
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    loadCurrentSong: function(){
        headings.textContent = this.currentSong.name;
        cdThumbMobile.style.backgroundImage = `url('${this.currentSong.image}')`;
        cdThumbPC.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    
    start: function(){
        // gan cau hinh tu config vao ung dung
        this.loadConfig()

        // dịnh ngĩa các thuộc tính cho object
        this.defineProperties();

        // lắng nghe các sự kiện
        this.handleEvent();
        
        // tải thông tin bài hát đầu khi chạy
        this.loadCurrentSong();

        //render playlist
        this.render();

        // hien trang thai ban dau cua btn Repeat & random
        randomBtn.classList.toggle('active',app.isRandom);
        repeatBtn.classList.toggle('active',app.isRepeat);
    }
}
app.start();

