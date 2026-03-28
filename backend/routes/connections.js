const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const { sendRequest, acceptRequest, declineRequest, removeConnection, getConnectionStatus, getConnections, getMyCounts } = require('../controllers/connectionController')

router.post('/request/:userId',  auth, sendRequest)
router.put('/accept/:userId',    auth, acceptRequest)
router.delete('/decline/:userId',auth, declineRequest)
router.delete('/remove/:userId', auth, removeConnection)
router.get('/counts',            auth, getMyCounts)
router.get('/status/:userId',    auth, getConnectionStatus)
router.get('/',                  auth, getConnections)

module.exports = router