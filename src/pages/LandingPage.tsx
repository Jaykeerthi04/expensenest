import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, PieChart, CreditCard, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-20">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Track your spending with ease
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-md">
              Take control of your finances by using our simple expense calculator.
            </p>
            <div className="mt-8">
              <Link to="/dashboard">
                <Button size="lg" className="mr-4">
                  Get Started
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 md:w-80 h-auto">
              {/* Phone frame with app screenshot */}
              <div className="rounded-[3rem] overflow-hidden border-8 border-gray-900 shadow-xl">
                <div className="aspect-[9/16] bg-white p-4">
                  <div className="mb-4 text-center">
                    <h2 className="text-lg font-bold">Expenses</h2>
                    <p className="text-2xl font-bold">$1,250.00</p>
                  </div>
                  
                  {/* Simulated pie chart */}
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 via-teal-500 to-orange-500"></div>
                  
                  {/* Simulated expense categories */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Housing</span>
                      <span className="font-semibold">$900</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Food</span>
                      <span className="font-semibold">$200</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Travel</span>
                      <span className="font-semibold">$150</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-100 rounded-full blur-lg"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-teal-100 rounded-full blur-lg"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Everything you need to manage expenses
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expense Tracking</h3>
              <p className="text-gray-600">
                Keep track of every expense with detailed categorization.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <PieChart className="text-teal-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Reports</h3>
              <p className="text-gray-600">
                See where your money goes with intuitive charts and reports.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Budget Planning</h3>
              <p className="text-gray-600">
                Set budget limits for different categories and track progress.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Financial Insights</h3>
              <p className="text-gray-600">
                Gain insights into your spending habits and identify savings opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have improved their financial health with ExpenseNest.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Start Now — It's Free!
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center mr-2">
                  <BarChart3 className="text-white" size={18} />
                </div>
                <span className="text-xl font-bold">ExpenseNest</span>
              </div>
              <p className="mt-2 text-gray-400 max-w-xs">
                The simple and effective way to track your expenses and improve your financial health.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>© {new Date().getFullYear()} ExpenseNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;