import express from 'express';
import { ethers } from 'ethers';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load ABI from the compiled contract
const contractPath = path.join(__dirname, '../../../blockchain/artifacts/contracts/PharmaChainOptimized.sol/PharmaChainOptimized.json');
const PharmaChainABI = JSON.parse(fs.readFileSync(contractPath, 'utf8')).abi;

const router = express.Router();

/**
 * @swagger
 * /api/laboratory/submit-test:
 *   post:
 *     summary: Submit laboratory test result for a batch
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenId
 *               - testId
 *               - passed
 *               - laboratory
 *               - labAddress
 *             properties:
 *               tokenId:
 *                 type: string
 *                 description: The NFT token ID of the batch
 *                 example: "0"
 *               testId:
 *                 type: string
 *                 description: Unique test identifier
 *                 example: "PURITY-001"
 *               passed:
 *                 type: boolean
 *                 description: Whether the test passed
 *                 example: true
 *               laboratory:
 *                 type: string
 *                 description: Laboratory name
 *                 example: "PharmaLab Testing Center"
 *               labAddress:
 *                 type: string
 *                 description: Laboratory wallet address
 *                 example: "0x742d35cc6639c0532feb32da7c1c0d7bb6de1f7f"
 *     responses:
 *       200:
 *         description: Test result submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Test result submitted successfully"
 *                 transactionHash:
 *                   type: string
 *                   example: "0x1234567890abcdef..."
 *                 testResult:
 *                   type: object
 *                   properties:
 *                     tokenId:
 *                       type: string
 *                     testId:
 *                       type: string
 *                     passed:
 *                       type: boolean
 *                     laboratory:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.post('/submit-test', authenticate, async (req, res) => {
  try {
    const { tokenId, testId, passed, laboratory, labAddress } = req.body;

    // Validate required fields
    if (!tokenId || !testId || typeof passed !== 'boolean' || !laboratory || !labAddress) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tokenId, testId, passed, laboratory, labAddress'
      });
    }

    // Initialize blockchain connection
    const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    const wallet = new ethers.Wallet(config.blockchain.privateKey, provider);
    const contract = new ethers.Contract(config.blockchain.contractAddress, PharmaChainABI, wallet);

    logger.info(`Submitting test result for batch ${tokenId}`, {
      tokenId,
      testId,
      passed,
      laboratory,
      labAddress
    });

    // Submit test result to blockchain
    const transaction = await contract.submitTestResult(tokenId, passed, {
      gasLimit: 150000,
      gasPrice: ethers.parseUnits('15', 'gwei')
    });

    const receipt = await transaction.wait();

    logger.info(`Test result submitted successfully`, {
      tokenId,
      testId,
      transactionHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString()
    });

    // Create response object
    const testResult = {
      tokenId: tokenId,
      testId: testId,
      passed: passed,
      laboratory: laboratory,
      labAddress: labAddress,
      timestamp: new Date().toISOString(),
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };

    res.json({
      success: true,
      message: 'Test result submitted successfully',
      transactionHash: receipt.hash,
      testResult: testResult
    });

  } catch (error) {
    logger.error('Error submitting test result:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    // Handle specific blockchain errors
    if (error.code === 'CALL_EXCEPTION') {
      return res.status(400).json({
        success: false,
        message: 'Smart contract call failed. Check if batch exists and laboratory is authorized.',
        error: error.reason || error.message
      });
    }

    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(500).json({
        success: false,
        message: 'Insufficient funds for blockchain transaction',
        error: 'Please contact administrator'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting test result',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/laboratory/test-results/{tokenId}:
 *   get:
 *     summary: Get all laboratory test results for a batch
 *     tags: [Laboratory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: The NFT token ID of the batch
 *         example: "0"
 *     responses:
 *       200:
 *         description: Test results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Test results retrieved successfully"
 *                 testResults:
 *                   type: object
 *                   properties:
 *                     labs:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["0x742d35cc6639c0532feb32da7c1c0d7bb6de1f7f"]
 *                     results:
 *                       type: array
 *                       items:
 *                         type: boolean
 *                       example: [true]
 *       400:
 *         description: Invalid token ID
 *       404:
 *         description: Batch not found
 *       500:
 *         description: Server error
 */
router.get('/test-results/:tokenId', authenticate, async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: 'Token ID is required'
      });
    }

    // Initialize blockchain connection
    const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    const contract = new ethers.Contract(config.blockchain.contractAddress, PharmaChainABI, provider);

    logger.info(`Retrieving test results for batch ${tokenId}`);

    // Get test results from blockchain
    const testResults = await contract.getLabTestResults(tokenId);

    logger.info(`Test results retrieved for batch ${tokenId}`, {
      tokenId,
      labCount: testResults.labs.length
    });

    // Format response
    const formattedResults = {
      labs: testResults.labs,
      results: testResults.results,
      summary: {
        totalTests: testResults.labs.length,
        passedTests: testResults.results.filter(result => result).length,
        failedTests: testResults.results.filter(result => !result).length
      }
    };

    res.json({
      success: true,
      message: 'Test results retrieved successfully',
      testResults: formattedResults
    });

  } catch (error) {
    logger.error('Error retrieving test results:', {
      error: error.message,
      stack: error.stack,
      tokenId: req.params.tokenId
    });

    if (error.code === 'CALL_EXCEPTION') {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or invalid token ID',
        error: error.reason || error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error retrieving test results',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/laboratory/status:
 *   get:
 *     summary: Get laboratory service status and info
 *     tags: [Laboratory]
 *     responses:
 *       200:
 *         description: Laboratory service status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Laboratory service is operational"
 *                 laboratory:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "PharmaLab Testing Center"
 *                     license:
 *                       type: string
 *                       example: "LAB-2025-001"
 *                     certification:
 *                       type: string
 *                       example: "ISO 17025:2017"
 *                     supportedTests:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Purity Analysis", "Potency Testing", "Sterility Test", "Contamination Screen"]
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Laboratory service is operational',
    laboratory: {
      name: 'PharmaLab Testing Center',
      license: 'LAB-2025-001',
      certification: 'ISO 17025:2017',
      address: '0x742d35cc6639c0532feb32da7c1c0d7bb6de1f7f',
      supportedTests: [
        'Purity Analysis',
        'Potency Testing', 
        'Sterility Test',
        'Contamination Screen',
        'Heavy Metals Testing',
        'Microbiological Testing',
        'Dissolution Testing',
        'Stability Testing'
      ]
    }
  });
});

export default router;