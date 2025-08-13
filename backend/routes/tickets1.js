// routes/tickets.js
import express from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  deleteTicket
} from '../controllers/ticketsController.js';

const router = express.Router();

router.get('/', getAllTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.put('/:id', updateTicketStatus);
router.delete('/:id', deleteTicket);

export default router;
