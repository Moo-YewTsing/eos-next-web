import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Viewer from '../components/Viewer'
import Dropzone from '../components/Dropzone'
import Head from 'next/head'

const API_URL = '34.70.0.203'
const axios = require('axios')

const W = 960
const H = 720

async function fetchPredict(file, setObjects, setStatus) {
  setStatus('loading')
  window.scrollTo(0, 0)
  setObjects([])

  let reader = new FileReader(); 
  reader.onload = function () {
  let b64 = reader.result.split(',')[1].toString('utf8');
  
  const img_data = { 'instances': [
                    {'image_bytes': {'b64': b64},
                     'key': 'eos'}
            ] }

    axios.post(`https://cors-anywhere.herokuapp.com/http://${API_URL}:8501/v1/models/eos:predict`, img_data)
    .then((res) => {
      const scores = res.data.predictions[0].detection_scores
      const boxs = res.data.predictions[0].detection_boxes
      const json = []
      let count = 0
      for (var i = 0; i < scores.length; i++){
          if (scores[i] > 0.3){
                json.push({'bbox':[{ "x": boxs[i][1]*W, "y": boxs[i][0]*H}, 
                                 { "x": boxs[i][3]*W, "y": boxs[i][2]*H}], 
                      })
                      count ++
          }
      }
      setObjects(json)
      window.alert(`${count} EOS are found`)
      setStatus('success')
    })
    .catch((error) => {
      setStatus('error')
      console.error(error)
    })
    };
  reader.readAsDataURL(file);
}

export default () => {
  const [file, setFile] = useState()
  const [status, setStatus] = useState('waiting')
  const [error, setError] = useState(null)
  const [objects, setObjects] = useState([])

  return (
    <>
      <Head>
        <title>Eosinophils Detection - An Demo to detect and count EOS on slides</title>
        <meta
          name="description"
          content="An Demo to detect and count EOS on slides.
                  Adpated from: An API to detect objects on images using tensorflow-js and Zeit Now"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout
        sidebar={
          <>
            {status === 'error' && (
              <div className="alert-red">
                <div className="alert-content">
                  {error || 'The API returned an error'}
                </div>
              </div>
            )}
            {status === 'success' && objects.length === 0 && (
              <div className="alert-orange">
                <div className="alert-content">
                  No objects detected on this image
                </div>
              </div>
            )}
            <div className="padding">
              <h1><i>Eosinophils</i>-Detection</h1>
              <h2>Upload an image</h2>
              <Dropzone
                setStatus={setStatus}
                setFile={setFile}
                setObjects={setObjects}
                fetchPredict={fetchPredict}
                setError={setError}
              />

              <p className="mb">
                
                This web-page is adpated from {' '}
                <a href="https://github.com/lucleray/object-detection">
                  object-detection 
                </a>
                {' '}created by
                {' '}
                <a
                  href="https://twitter.com/lucleray"
                  target="_blank"
                  rel="noreferrer"
                >
                  @lucleray
                </a>
              </p>

            </div>
          </>
        }
      >
        <Viewer file={file} objects={objects} status={status} />
      </Layout>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        }
        h1 {
          margin-bottom: 1em;
          font-weight: bold;
          font-size: 1.3em;
          padding-bottom: 0.8em;
          color: #555;
          border-bottom: 1px solid #eee;
        }
        h2 {
          margin-bottom: 1em;
          font-weight: bold;
          font-size: 1.3em;
        }
        .alert-orange {
          background: rgba(255, 127, 80, 1);
          color: white;
        }
        .alert-red {
          background: rgba(255, 0, 0, 0.8);
          color: white;
        }
        .alert-content {
          padding: 10px 25px 15px 25px;
          text-align: center;
          font-weight: bold;
        }
        .padding {
          padding: 30px 40px;
        }
        button.link,
        a {
          color: rgb(32, 89, 246);
          border-bottom: 1px solid rgba(32, 89, 246, 0.9);
          border-top: 0;
          border-left: 0;
          border-right: 0;
          text-decoration: none;
          font-size: inherit;
          font-weight: inherit;
          cursor: pointer;
        }
        p {
          line-height: 1.5em;
          font-size: 1.1em;
        }
        p.mb {
          margin-bottom: 1em;
        }
      `}</style>
    </>
  )
}
