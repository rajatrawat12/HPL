import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    aadhaarNumber: '',
    address: '',
    pinCode: '',
    state: '',
    role: 'BATSMAN',
    isHaraiya: false,
    fairPlayGrade: 'A'
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState('')
  const [players, setPlayers] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [tableError, setTableError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = players.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(players.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    let timer
    if (success) {
      timer = setTimeout(() => {
        setSuccess(false)
      }, 3000)
    }
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [success])

  const fetchPlayers = async () => {
    setTableLoading(true)
    setTableError('')
    try {
      const response = await fetch('https://galli11-production.up.railway.app/galli11-v1-player/all')
      if (!response.ok) {
        throw new Error('Failed to fetch players')
      }
      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      setTableError(error,'Failed to load players data')
    } finally {
      setTableLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  const validateForm = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    
    // Mobile validation
    if (!form.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required'
    } else if (!/^[0-9]{10}$/.test(form.mobile)) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits'
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Aadhaar validation
    if (!form.aadhaarNumber.trim()) {
      newErrors.aadhaarNumber = 'Aadhaar number is required'
    } else if (!/^[0-9]{12}$/.test(form.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits'
    }
    
    if (!form.address.trim()) newErrors.address = 'Address is required'
    
    // Pincode validation
    if (!form.pinCode) {
      newErrors.pinCode = 'Pin code is required'
    } else if (!/^[0-9]{6}$/.test(form.pinCode)) {
      newErrors.pinCode = 'Pin code must be exactly 6 digits'
    }
    
    if (!form.state.trim()) newErrors.state = 'State is required'
    if (!form.role.trim()) newErrors.role = 'Role is required'
    if (!form.fairPlayGrade) newErrors.fairPlayGrade = 'Fair Play Grade is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Handle numeric input restrictions
    if (name === 'mobile' || name === 'aadhaarNumber' || name === 'pinCode') {
      // Only allow digits and limit length
      const numericValue = value.replace(/[^0-9]/g, '')
      const maxLength = name === 'mobile' ? 10 : name === 'aadhaarNumber' ? 12 : 6
      const truncatedValue = numericValue.slice(0, maxLength)
      
      setForm(prev => ({ ...prev, [name]: truncatedValue }))
    } else {
      setForm(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setSuccess(false)
    setFormError('')
    try {
      // Format Aadhaar number with hyphens
      const formattedAadhaar = form.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
      
      const response = await fetch('https://galli11-production.up.railway.app/galli11-v1-player/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          mobile: form.mobile,
          email: form.email,
          aadhaarNumber: formattedAadhaar,
          address: form.address,
          pinCode: form.pinCode,
          state: form.state,
          role: form.role,
          isHaraiya: form.isHaraiya,
          fairPlayGrade: form.fairPlayGrade
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to submit form')
      }

      await response.json()
      setSuccess(true)
      // Reset form after successful submission
      setForm({
        name: '',
        mobile: '',
        email: '',
        aadhaarNumber: '',
        address: '',
        pinCode: '',
        state: '',
        role: 'BATSMAN',
        isHaraiya: false,
        fairPlayGrade: 'A'
      })
      // Refresh the table data only on successful submission
      fetchPlayers()
    } catch (error) {
      setFormError(error.message || 'An error occurred while submitting the form')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between w-full bg-white rounded-lg">
          <form
            className="p-8 rounded-lg shadow-lg space-y form-container"
            onSubmit={handleSubmit}
          >
            <div className='flex flex-row justify-center mb-4 align-middle'>
              <img src="images/background.jpeg" alt="Form Background" className='w-[10%] h-[10%] rounded-full'  />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-center text-indigo-600 sm:text-3xl">Player Registration For HPL-3</h2>
            <div className="flex flex-col items-center justify-center p-4 mb-6 text-center rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100">
              <p className="text-lg font-semibold text-indigo-700">Sponsored by: Bazzario</p>
              <a 
                href="https://play.google.com/store" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 mt-2 text-indigo-600 transition-colors hover:text-indigo-800"
              >
                <span className="text-2xl">📲</span>
                <span className="text-base">Download the Bazzario app now from the Play Store!</span>
              </a>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
              <div className="w-full">
                <label className="block mb-1 text-sm font-semibold text-gray-700">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="w-full">
                <label className="block mb-1 text-sm font-semibold text-gray-700">Mobile</label>
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter 10 digit mobile number"
                />
                {errors.mobile && <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>}
              </div>

              <div className="w-full">
                <label className="block mb-1 text-sm font-semibold text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="w-full">
                <label className="block mb-1 text-sm font-semibold text-gray-700">Aadhaar Number</label>
                <input
                  name="aadhaarNumber"
                  value={form.aadhaarNumber}
                  onChange={handleChange}
                  maxLength={12}
                  className={`w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${errors.aadhaarNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter 12 digit Aadhaar number"
                />
                {errors.aadhaarNumber && <p className="mt-1 text-sm text-red-500">{errors.aadhaarNumber}</p>}
              </div>

              <div className="w-full md:col-span-2">
                <label className="block mb-1 text-sm font-semibold text-gray-700">Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your address"
                />
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
              </div>

              <div className="w-full">
                <label className="block mb-1 text-sm font-semibold text-gray-700">Pin Code</label>
                <input
                  name="pinCode"
                  value={form.pinCode}
                  onChange={handleChange}
                  maxLength={6}
                  className={`w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${errors.pinCode ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter 6 digit pin code"
                />
                {errors.pinCode && <p className="mt-1 text-sm text-red-500">{errors.pinCode}</p>}
              </div>

              <div className="w-full">
                <label className="block mb-1 text-sm font-semibold text-gray-700">State</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter state"
                />
                {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
              </div>

              <div className="w-full">
                <label className="block mb-1 text-sm font-semibold text-gray-700">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="BATSMAN">BATSMAN</option>
                  <option value="BOWLER">BOWLER</option>
                  <option value="ALLROUNDER">ALL ROUNDER</option>
                </select>
                {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role}</p>}
              </div>

              <div className="w-full">
                <label className="block mb-1 text-sm font-semibold text-gray-700">Is Haraiya</label>
                <select
                  name="isHaraiya"
                  value={form.isHaraiya}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${errors.isHaraiya ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
                {errors.isHaraiya && <p className="mt-1 text-sm text-red-500">{errors.isHaraiya}</p>}
              </div>

              <div className="w-full">
                <label className="block mb-1 text-sm font-semibold text-gray-700">Fair Play Grade</label>
                <select
                  name="fairPlayGrade"
                  value={form.fairPlayGrade}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${errors.fairPlayGrade ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
                {errors.fairPlayGrade && <p className="mt-1 text-sm text-red-500">{errors.fairPlayGrade}</p>}
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full py-3 font-semibold text-white transition-colors bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 disabled:bg-indigo-400"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            {success && (
              <div className="p-4 mt-4 text-center text-green-700 bg-green-100 rounded-md">
                Form submitted successfully!
              </div>
            )}
            
            {formError && (
              <div className="p-4 mt-4 text-center text-red-700 bg-red-100 rounded-md">
                {formError}
              </div>
            )}
          </form>
          <div className="w-[50%] tournament-image rounded-3xl">
              <img src="images/formBackground.jpeg" alt="Form Background" className='rounded-lg'  />
          </div>
        </div>

        {/* Players Table */}
        <div className="w-full mt-12">
          <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Players List</h2>
          {tableLoading ? (
            <div className="py-4 text-center">Loading players data...</div>
          ) : tableError ? (
            <div className="py-4 text-center text-red-500">{tableError}</div>
          ) : (
            <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-lg">
              <div className="min-w-[1200px]">
                <table className="w-full bg-white divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-indigo-50">
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-indigo-600 uppercase border-b sm:px-6">Name</th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-indigo-600 uppercase border-b sm:px-6">Mobile</th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-indigo-600 uppercase border-b sm:px-6">Email</th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-indigo-600 uppercase border-b sm:px-6">Role</th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-indigo-600 uppercase border-b sm:px-6">Fair Play Grade</th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-indigo-600 uppercase border-b sm:px-6">Address</th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-indigo-600 uppercase border-b sm:px-6">Pin Code</th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-indigo-600 uppercase border-b sm:px-6">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((player) => (
                      <tr key={player.id} className="transition-colors hover:bg-indigo-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 whitespace-nowrap">{player.name}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 whitespace-nowrap">{player.mobile}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 whitespace-nowrap">{player.email}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 whitespace-nowrap">{player.role}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 whitespace-nowrap">{player.fairPlayGrade}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 whitespace-nowrap">{player.address}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 whitespace-nowrap">{player.pinCode}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 sm:px-6 whitespace-nowrap">{player.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between w-full">
                    <div className="hidden sm:block">
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, players.length)}
                        </span>{' '}
                        of <span className="font-medium">{players.length}</span> results
                      </p>
                    </div>
                    <div className="flex items-center justify-end w-full sm:w-auto">
                      <nav className="inline-flex space-x-2 rounded-md shadow-sm isolate" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
                              currentPage === index + 1
                                ? 'z-10 bg-indigo-600 text-white'
                                : 'text-gray-900 bg-white hover:bg-gray-50'
                            } border border-gray-300 rounded-md`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
