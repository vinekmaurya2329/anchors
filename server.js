const express = require('express')
const app = express();
const port  = 3000;
const Db = require('./db')
const axios = require('axios');
const sendmail =  require('./mailer');
const parser = require('body-parser')
const ytdl = require('ytdl-core');
const { google } = require('googleapis');
require('dotenv').config()

const APIKEY = "AIzaSyCOxGhWdaeYeegJAkrUM6pUqve9JEpZyac";
// const baseurl = "https://www.googleapis.com/youtube/v3";
const baseurl = "https://www.googleapis.com/youtube/v3"
var subscribersGlobal ;
app.use(parser.urlencoded({extended: true}));
app.use(express.json())
app.set('view engine','ejs');
app.use(express.static('public'))



app.get('/',(req,res)=>{
    res.render('landingPage')
})


app.post('/search',async(req,res)=>{  
    const videourl  = req.body.videoUrl;

    async function getVideoInfo(videoUrl) {
        try {
          // Extract video ID from the URL
          const videoId = ytdl.getURLVideoID(videoUrl);
      
          // Set up the YouTube Data API
          const youtube = google.youtube({
            version: 'v3',
            auth: APIKEY,
          });
      
          // Make a request to the videos endpoint to get information about the video
          const response = await youtube.videos.list({
            part: 'snippet',
            id: videoId,
          });
      
          // Extract relevant information from the response
          
          const videoInfo = response.data.items[0].snippet;
      
          // Display the video information
         
          console.log('Video Title:', videoInfo);
          const videoID = ytdl.getURLVideoID(videoUrl);

          const {videoDetails,arr} = await  getVideoStats(videoID)
          // console.log(arr ,'arr');
      res.render('earningPage',{response:videoInfo,videoDetails:videoDetails,arr:arr})

        //   console.log('Video Description:', videoInfo.description);
        //   console.log('Channel:', videoInfo.channelTitle);
        } catch (error) {
          console.error('Error:', error.message);
        }
       
      }
      

      getVideoInfo(videourl);


    // -------------------------------------------------------

    async function getVideoStats(videoId) {
        try {
          // Set up the YouTube Data API
          const youtube = google.youtube({
            version: 'v3',
            auth: APIKEY,
          });
      
          // Make a request to the videos endpoint to get statistics for the video
          const videoResponse = await youtube.videos.list({
            part: 'snippet,statistics',
            id: videoId,
          });
      
          // Extract relevant information from the video response
          const videoItem = videoResponse.data.items[0];
      
          if (!videoItem) {
            console.error('Video not found.');
            return;
          }
      
          const videoStats = videoItem.statistics || {};
          const views = videoStats.viewCount || 'N/A';
          const likes = videoStats.likeCount || 'N/A';
          const dislikes = videoStats.dislikeCount || 'N/A';
          const comments = videoStats.commentCount || 'N/A';
      
          // Display the statistics
          console.log('Views:', views);
          console.log('Likes:', likes);
          console.log('Dislikes:', dislikes);
          console.log('Comments:', comments);
      
          // Extract the channel ID from the video response
          const channelId = videoItem.snippet.channelId;
      
          // Make a request to the channels endpoint to get subscriber count for the channel
          const channelResponse = await youtube.channels.list({
            part: 'statistics',
            id: channelId,
          });
      
          // Extract relevant information from the channel response
          const channelItem = channelResponse.data.items[0];
      
          if (!channelItem) {
            console.error('Channel not found.');
            return;
          }
      
          const channelStats = channelItem.statistics || {};
          const subscribers = channelStats.subscriberCount || 'N/A';
           subscribersGlobal = subscribers;
       let min = 0;
       if(views< subscribers){
          min = views
       } else{
        min = subscribers
       }
       let totalEarn = Number(min) +Number( 10*comments) +Number(5*likes) ;
          const videoDetails = {
                    viewCount :views,
                    likeCount: likes,
                    commentCount: comments,
                    subscriberCount : subscribers,
                    totalEarn : totalEarn
                  }

              let arr =  await  getAllVideosDetailsFromChannel(APIKEY, channelId)
    return {videoDetails ,arr} ;
          // Display the subscriber count
        //   console.log('videostats',videoStats);
        //   console.log('Subscribers:', subscribers);
        } catch (error) {
          console.error('Error:', error.message);
        }
      }

//     --------------- get all video function        --------------------------------------------------------
async function getAllVideosDetailsFromChannel(apiKey, channelId) {
    try {
      // Set up the YouTube Data API
      const youtube = google.youtube({
        version: 'v3',
        auth: APIKEY,
      });
  
      // Fetch the uploads playlist ID for the channel
      const uploadsPlaylistResponse = await youtube.channels.list({
        part: 'contentDetails',
        id: channelId,
      });
  
      const uploadsPlaylistId =
        uploadsPlaylistResponse.data.items[0].contentDetails.relatedPlaylists.uploads;
  
      // Fetch all videos from the uploads playlist
      const playlistItemsResponse = await youtube.playlistItems.list({
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: 20, // You can adjust the number of results as needed
      });
  
      // Display details of all videos in the uploads playlist
      console.log('Details of All Videos in the Channel:');
    let arr = []
      for (const item of playlistItemsResponse.data.items) {
        const videoTitle = item.snippet.title;
        const videoId = item.contentDetails.videoId;
        const thumbnail  = item.snippet.thumbnails.high.url;
        // Fetch video statistics
        const videoStatsResponse = await youtube.videos.list({
          part: 'statistics',
          id: videoId,
        });
  
        const videoStats = videoStatsResponse.data.items[0].statistics;
        const views = videoStats.viewCount || 'N/A';
        const likes = videoStats.likeCount || 'N/A';
        const comments = videoStats.commentCount || 'N/A';
  
        // Display video details
        let min = 0;
        if(views< subscribersGlobal){
           min = views
        } else{
         min = subscribersGlobal
        }
        let totalEarn = Number(min) +Number( 10*comments) +Number(5*likes) ;
        const allVideoDetails = {
            views : views ,
            likes : likes,
            comments: comments,
            title: videoTitle,
            thumbnail :thumbnail,
            totalEarn:totalEarn
        }
        // console.log(allVideoDetails);
        
        arr.push(allVideoDetails)
      }
      return arr ;
    //    console.log(allVideoDetails);  
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
})

 


app.get('/email', sendmail)

app.get('/earningPage',(req,res)=>{ 
    res.render('earningPage') 
   
})


app.listen(process.env.PORT,()=>{
    console.log(`server is strted on  ${process.env.PORT}`);
}) 