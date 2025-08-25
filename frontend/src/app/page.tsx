import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ServiceBooking } from '@/components/ui/ServiceBooking';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Professional Repair Services
            <br />
            <span className="text-blue-200">When You Need Them</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Connect with skilled technicians for electronics, appliances, automotive, and home maintenance. 
            Professional, reliable, and convenient repair services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Book a Service
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
              Become a Technician
            </button>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-dark mb-4">Our Services</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Professional repair services across multiple categories with certified technicians
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '📱',
                title: 'Electronics',
                description: 'Smartphone, laptop, tablet, and gaming console repairs',
                services: ['Screen replacement', 'Battery replacement', 'Water damage repair']
              },
              {
                icon: '🏠',
                title: 'Appliances',
                description: 'Home appliance maintenance and repair services',
                services: ['Washing machine', 'Refrigerator', 'Dishwasher', 'HVAC']
              },
              {
                icon: '🚗',
                title: 'Automotive',
                description: 'Mobile automotive maintenance and repair',
                services: ['Oil change', 'Brake service', 'Battery replacement']
              },
              {
                icon: '🔧',
                title: 'Home Maintenance',
                description: 'Professional home repair and maintenance',
                services: ['Plumbing', 'Electrical', 'Carpentry', 'Painting']
              }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-text-dark mb-2">{category.title}</h3>
                <p className="text-text-secondary mb-4">{category.description}</p>
                <ul className="text-sm text-text-secondary space-y-1">
                  {category.services.map((service, serviceIndex) => (
                    <li key={serviceIndex} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-dark mb-4">Book Your Service</h2>
            <p className="text-text-secondary text-lg">
              Get started by selecting your service category and scheduling your appointment
            </p>
          </div>
          
          <ServiceBooking />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-dark mb-4">Why Choose RepairX?</h2>
            <p className="text-text-secondary text-lg">
              We maintain the highest quality standards with Six Sigma methodology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🛡️',
                title: 'Verified Technicians',
                description: 'All technicians are background-checked, licensed, and verified for quality and safety'
              },
              {
                icon: '⚡',
                title: 'Fast Response',
                description: 'Same-day or next-day service availability with real-time tracking'
              },
              {
                icon: '💯',
                title: 'Quality Guarantee',
                description: '100% satisfaction guarantee with Six Sigma quality standards (< 3.4 DPMO)'
              },
              {
                icon: '💰',
                title: 'Transparent Pricing',
                description: 'Upfront pricing with no hidden fees. Pay securely through the platform'
              },
              {
                icon: '📱',
                title: 'Real-time Updates',
                description: 'Track your service request and communicate with technicians in real-time'
              },
              {
                icon: '⭐',
                title: '5-Star Service',
                description: 'Rated by thousands of satisfied customers with 95%+ satisfaction rate'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-text-dark mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
