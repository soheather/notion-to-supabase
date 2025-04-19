"use client"

import type React from "react"
import { useState, useCallback } from "react"

interface FormData {
  name: string
  email: string
  message: string
}

const Form: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      // Handle form submission logic here (e.g., send data to an API)
      console.log("Form submitted:", formData)
      // Reset the form after submission
      setFormData({
        name: "",
        email: "",
        message: "",
      })
    },
    [formData],
  )

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="message">Message:</label>
        <textarea id="message" name="message" value={formData.message} onChange={handleChange} required />
      </div>
      <button type="submit">Submit</button>
    </form>
  )
}

export default Form
