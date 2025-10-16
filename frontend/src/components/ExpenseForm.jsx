import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createExpense } from '../features/expenses/expenseSlice'

function ExpenseForm() {
  const [text, setText] = useState('')

  const dispatch = useDispatch()

  const onSubmit = (e) => {
    e.preventDefault()

    dispatch(createExpense({ text }))
    setText('')
  }

  return (
    <section className='form'>
      <form onSubmit={onSubmit}>
        <div className='form-group'>
          <label htmlFor='text'>Expense</label>
          <input
            type='text'
            name='text'
            id='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className='form-group'>
          <button className='btn btn-block' type='submit'>
            Add Expense
          </button>
        </div>
      </form>
    </section>
  )
}

export default ExpenseForm
