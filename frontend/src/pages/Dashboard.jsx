import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseItem from '../components/ExpenseItem'
import Spinner from '../components/Spinner'
import { getExpenses, reset } from '../features/expenses/expenseSlice'

function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector((state) => state.auth)
  const { expenses, isLoading, isError, message } = useSelector(
    (state) => state.expenses
  )

  useEffect(() => {
    if (isError) {
      console.log(message)
    }

    if (!user) {
      navigate('/login')
    }

    dispatch(getExpenses())

    return () => {
      dispatch(reset())
    }
  }, [user, navigate, isError, message, dispatch])

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <section className='heading'>
        <h1>Welcome {user && user.name}</h1>
        <p>Expenses Dashboard</p>
      </section>

      <ExpenseForm />

      <section className='content'>
        {expenses.length > 0 ? (
          <div className='expenses'>
            {expenses.map((expense) => (
              <ExpenseItem key={expense._id} expense={expense} />
            ))}
          </div>
        ) : (
          <h3>You have not set any expenses</h3>
        )}
      </section>
    </>
  )
}

export default Dashboard
