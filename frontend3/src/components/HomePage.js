import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './HomePage.css';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <Navbar />
      
      
      {isAuthenticated && (
        <div className="user-dashboard">
          <h2>Welcome back, {currentUser?.name || 'Friend'}!</h2>
          <div className="dashboard-actions">
            <Link to="/expenses" className="dashboard-action">
              <i className="fas fa-receipt"></i>
              <span>Manage Expenses</span>
            </Link>
            <Link to="/groups" className="dashboard-action">
              <i className="fas fa-users"></i>
              <span>Manage Groups</span>
            </Link>
          </div>
          
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-receipt"></i>
                </div>
                <div className="activity-content">
                  <p>Your recent expenses will appear here</p>
                  <span className="activity-meta">Start by adding new expenses</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="balances-overview">
            <h3>Your Balances</h3>
            <div className="balance-cards">
              <div className="balance-card">
                <h4>You are owed</h4>
                <p className="balance positive">$0.00</p>
              </div>
              <div className="balance-card">
                <h4>You owe</h4>
                <p className="balance negative">$0.00</p>
              </div>
              <div className="balance-card">
                <h4>Total balance</h4>
                <p className="balance">$0.00</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      
      {!isAuthenticated && (
        <>
          <div className="hero-section">
            <div className="hero-content">
              <h1>Split Expenses with Friends and Family</h1>
              <p className="tagline">The easiest way to share expenses and settle up with friends and family</p>
              {!isAuthenticated ? (
                <Link to="/login" className="sign-up-button">Get Started</Link>
              ) : (
                <Link to="/expenses" className="sign-up-button">View Your Expenses</Link>
              )}
            </div>
            <div className="hero-image">
              <img src="/hero-image.png" alt="People sharing expenses" />
            </div>
          </div>
          <div className="features-section">
            <h2>Why Use SplitEase?</h2>
            <div className="features-container">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-calculator"></i>
                </div>
                <h3>Track Balances</h3>
                <p>Keep track of shared expenses and balances with housemates, trips, groups, friends, and family.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h3>Organize with Groups</h3>
                <p>Create groups for your home, trips, or anything else. Keep your expenses organized in one place.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h3>Add Expenses On The Go</h3>
                <p>Quickly add expenses as soon as they happen. Access your accounts from anywhere.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <h3>Settle Up Easily</h3>
                <p>Settle debts with a simplified payment history, all in one place.</p>
              </div>
            </div>
          </div>
          
          <div className="how-it-works">
            <h2>How It Works</h2>
            <div className="steps-container">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Add an expense</h3>
                <p>Enter the expense details, and we'll split it according to your preferences.</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>SplitEase does the math</h3>
                <p>We'll keep track of who owes what and simplify the debts among your friends.</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Settle up</h3>
                <p>Settle debts with friends directly through the app or outside of it.</p>
              </div>
            </div>
          </div>
          
          <div className="testimonials-section">
            <h2>What Our Users Say</h2>
            <div className="testimonial-container">
              <div className="testimonial">
                <p>"SplitEase made our group trips so much easier! No more awkward money conversations."</p>
                <p className="testimonial-author">- Sarah T.</p>
              </div>
              <div className="testimonial">
                <p>"Managing apartment expenses with roommates has never been simpler."</p>
                <p className="testimonial-author">- Michael R.</p>
              </div>
              <div className="testimonial">
                <p>"This app saved our friendships during our vacation! Highly recommend!"</p>
                <p className="testimonial-author">- Jamie L.</p>
              </div>
            </div>
          </div>
          
          <div className="cta-section">
            <h2>Ready to start splitting expenses?</h2>
            <Link to="/signup" className="cta-button">Sign Up Now - It's Free!</Link>
          </div>
        </>
      )}
      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span>SplitEase</span>
            <p>The easiest way to share expenses</p>
          </div>
          <div className="footer-links">
          {!isAuthenticated && (
            <>
            <div className="footer-column">
              <h4>Account</h4>
              <Link to="/login">Log In</Link>
              <Link to="/signup">Sign Up</Link>
            </div>
            </>
            )}
            <div className="footer-column">
              <h4>Information</h4>
              <Link to="/about">About Us</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
