import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import arcLogo from '../../assets/logo.png';

const Footer = () => {
    return (
      <footer className="bg-brand-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
            <img src={arcLogo} alt="ARC Actuarial and Risk Consulting" className="h-12 mb-4 object-contain" />
            <p className="text-brand-sand/70 mb-4">
              ARC FlowSuite brings portfolio clarity, project governance, and client-ready reporting together in one
              elegant workspace.
            </p>
            </div>

{/* Quick Links */}
<div>
  <h3 className="text-lg font-medium mb-4">Quick Links</h3>
  <ul className="space-y-2">
    <li>
    <a href="#features" className="text-brand-sand/70 hover:text-brand-gold transition-colors">
                  Features
                </a>
              </li>
              <li>
              <a href="#workflow" className="text-brand-sand/70 hover:text-brand-gold transition-colors">
                  Workflow
                </a>
              </li>
              <li>
              <a href="#cta" className="text-brand-sand/70 hover:text-brand-gold transition-colors">
                  Outcomes
                </a>
              </li>
              <li>
              <Link to="/login" className="text-brand-sand/70 hover:text-brand-gold transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
              <Link to="/register" className="text-brand-sand/70 hover:text-brand-gold transition-colors">
                  Request Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
          <h3 className="text-lg font-medium mb-4">Capabilities</h3>
            <ul className="space-y-2">
              <li>
              <span className="text-brand-sand/70">Risk governance dashboards</span>
              </li>
              <li>
              <span className="text-brand-sand/70">Client engagement portals</span>
              </li>
              <li>
              <span className="text-brand-sand/70">Compliance-ready audit logs</span>
              </li>
              <li>
              <span className="text-brand-sand/70">Portfolio forecasting</span>
              </li>
              <li>
              <span className="text-brand-sand/70">Stakeholder communications</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-medium mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
              <MapPin size={18} className="mr-2 text-brand-gold mt-0.5" />
                <span className="text-brand-sand/70">
                  14th Floor, ARC House<br />
                  Dar es Salaam, Tanzania
                </span>
              </li>
              <li className="flex items-center">
              <Phone size={18} className="mr-2 text-brand-gold" />
                <span className="text-brand-sand/70">+255 (0) 700 000 000</span>
              </li>
              <li className="flex items-center">
              <Mail size={18} className="mr-2 text-brand-gold" />
                <span className="text-brand-sand/70">hello@arcconsulting.co.tz</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-brand-sand/60 text-sm">
              &copy; {new Date().getFullYear()} ARC Actuarial &amp; Risk Consulting (T) Limited. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-brand-sand/60 text-sm">Enterprise SLAs</span>
              <span className="text-brand-sand/60 text-sm">Security &amp; Privacy</span>
              <span className="text-brand-sand/60 text-sm">Support Center</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;