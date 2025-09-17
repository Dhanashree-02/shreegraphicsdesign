import Sheela from '../assets/Team/Sheela.jpeg'
import Kavita from "../assets/Team/Kavita.jpeg"
import Sunil from '../assets/Team/Sunil.jpeg'
import Shahaji from '../assets/Team/Shahaji.jpeg'
import Shubham from "../assets/Team/Shubham.jpeg"
import Shailesh from "../assets/Team/Sailesh.jpeg"

import { CheckCircleIcon, UserGroupIcon, TrophyIcon } from '@heroicons/react/24/outline'

const About = () => {
  const stats = [
    { label: 'Happy Clients', value: '500+' },
    { label: 'Projects Completed', value: '1000+' },
    { label: 'Years Experience', value: '10+' },
    { label: 'Team Members', value: '15+' }
  ]

  const values = [
    {
      icon: CheckCircleIcon,
      title: 'Quality First',
      description: 'We never compromise on quality and ensure every design meets the highest standards.'
    },
    {
      icon: UserGroupIcon,
      title: 'Customer Focused',
      description: 'Our clients are at the heart of everything we do. We listen, understand, and deliver.'
    },
    {
      icon: TrophyIcon,
      title: 'Creative Excellence',
      description: 'We push creative boundaries to deliver unique and memorable design solutions.'
    }
  ]

  const team = [
    {
      name: 'Kavita Sunil Gopale ',
      // role: 'Founder & Creative Director',
      image: Kavita,
      // description: 'With over 10 years of experience in graphic design and branding.'
    },
    {
      name: 'Sheela Hemant Lankhe',
      // role: 'Senior Designer',
      image: Sheela ,
      // description: 'Specializes in logo design and brand identity development.'
    },
    {
      name: 'Sunil Yashwant Gopale',
      // role: 'Embroidery Specialist',
      image: Sunil,
      // description: 'Expert in custom embroidery and textile design solutions.'
    },
    {
      name: 'Shailesh Shaha Lamkhade',
      // role: 'Embroidery Specialist',
      image: Shailesh,
      // description: 'Expert in custom embroidery and textile design solutions.'
    },
    {
      name: 'Shubham Balaso Mane',
      // role: 'Embroidery Specialist',
      image: Shubham,
      // description: 'Expert in custom embroidery and textile design solutions.'
    },
    {
      name: 'Shahaji Maliba Lamkhade',
      // role: 'Embroidery Specialist',
      image: Shahaji,
      // description: 'Expert in custom embroidery and textile design solutions.'
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About Shree Graphics Design
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            We are passionate designers dedicated to creating exceptional visual identities 
            that help businesses stand out and succeed in today's competitive market.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2014, Shree Graphics Design started as a small studio with a big vision: 
                to help businesses create powerful visual identities that resonate with their audience.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Over the years, we've grown into a full-service design agency, serving clients 
                across various industries. From startups to established enterprises, we've helped 
                hundreds of businesses tell their story through compelling design.
              </p>
              <p className="text-lg text-gray-600">
                Today, we continue to push creative boundaries while staying true to our core values 
                of quality, creativity, and customer satisfaction.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Our Design Studio"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape how we work with our clients.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our talented team of designers and specialists work together to bring your vision to life.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-80 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Let's discuss your project and see how we can help bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get In Touch
            </a>
            <a
              href="/products"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              View Our Work
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About