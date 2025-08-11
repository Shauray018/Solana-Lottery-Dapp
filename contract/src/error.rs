use anchor_lang::prelude::error_code; 

#[error_code] 

pub enum LotteryError { 
    #[msg("Winner already existes")]
    WinnerAlreadyExists, 
    #[msg("Can't choose a winner")]
    NoTickets, 
    #[msg("Winner has not been chosen.")]
    WinnerNotChosen, 
    #[msg("Invalid winner")]
    AlreadyClaimed
}