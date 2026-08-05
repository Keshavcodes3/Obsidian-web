import bcrypt from 'bcrypt'

export const hashPassword = async (password: string, saltNumber?: number) => {
    saltNumber = Math.round(Math.random() * 10)
    const hashed = await bcrypt.hash(password, saltNumber)
    return hashed
}